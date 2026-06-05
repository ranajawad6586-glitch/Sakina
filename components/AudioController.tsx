"use client";

import { useEffect } from "react";
import { DEFAULT_RECITER_ID, audioUrl } from "@/lib/reciters";

const RECITER_STORAGE_KEY = "sakina:reciter";
const RECITER_CHANGE_EVENT = "sakina:reciter-changed";

function readReciter(): string {
  try {
    return (
      window.localStorage.getItem(RECITER_STORAGE_KEY) || DEFAULT_RECITER_ID
    );
  } catch {
    return DEFAULT_RECITER_ID;
  }
}

function setButtonState(
  el: HTMLElement | null,
  state: "idle" | "loading" | "playing",
) {
  if (!el) return;
  el.classList.toggle("is-loading", state === "loading");
  el.classList.toggle("is-playing", state === "playing");
  el.setAttribute(
    "title",
    state === "playing" ? "Pause" : state === "loading" ? "Loading…" : "Play",
  );
}

/**
 * Single page-level audio controller. One <audio> element lives for
 * the lifetime of the page — we set src and call play() for every
 * verse, including auto-advance. That matters because browsers track
 * "user-activated" status on the audio element itself; spawning a
 * fresh Audio() inside an ended-event handler loses that activation
 * and play() gets silently blocked.
 *
 * Auto-advance: when a verse finishes, the next [data-verse-audio]
 * on the page plays automatically and is scrolled smoothly to
 * centre. The chain stops at end-of-surah. Any user action (pause,
 * click a different verse, reciter change) breaks the chain.
 */
export function AudioController() {
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let currentBtn: HTMLElement | null = null;

    function ensureAudio(): HTMLAudioElement {
      if (audio) return audio;
      const el = new Audio();
      el.preload = "auto";
      el.addEventListener("playing", () => {
        if (currentBtn) setButtonState(currentBtn, "playing");
      });
      el.addEventListener("ended", handleEnded);
      el.addEventListener("error", handleError);
      audio = el;
      return el;
    }

    function handleError() {
      if (!currentBtn) return;
      setButtonState(currentBtn, "idle");
      currentBtn.setAttribute("title", "Recitation unavailable");
      currentBtn = null;
    }

    function handleEnded() {
      if (!currentBtn) return;
      const finished = currentBtn;
      setButtonState(finished, "idle");

      // Auto-advance to the next [data-verse-audio] in DOM order.
      const all = Array.from(
        document.querySelectorAll<HTMLElement>("[data-verse-audio]"),
      );
      const idx = all.indexOf(finished);
      const next = idx >= 0 ? all[idx + 1] : null;

      if (!next) {
        currentBtn = null;
        return;
      }

      const key = next.getAttribute("data-verse-audio") || "";
      const [s, a] = key.split(":").map((x) => Number.parseInt(x, 10));
      if (!Number.isFinite(s) || !Number.isFinite(a)) {
        currentBtn = null;
        return;
      }

      next.scrollIntoView({ behavior: "smooth", block: "center" });
      playVerse(next, s, a);
    }

    function playVerse(btn: HTMLElement, s: number, a: number) {
      const el = ensureAudio();
      currentBtn = btn;
      setButtonState(btn, "loading");
      el.src = audioUrl(readReciter(), s, a);
      el.play().catch(() => {
        // Browser blocked playback (autoplay policy, network, etc.)
        if (currentBtn === btn) setButtonState(btn, "idle");
      });
    }

    function stopActive() {
      if (audio && !audio.paused) audio.pause();
      if (currentBtn) {
        setButtonState(currentBtn, "idle");
        currentBtn = null;
      }
    }

    function onClick(e: Event) {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>("[data-verse-audio]");
      if (!btn) return;
      e.preventDefault();

      const key = btn.getAttribute("data-verse-audio") || "";
      const [s, a] = key.split(":").map((x) => Number.parseInt(x, 10));
      if (!Number.isFinite(s) || !Number.isFinite(a)) return;

      // Tap on currently-playing verse → pause and break the chain.
      if (currentBtn === btn && audio && !audio.paused) {
        stopActive();
        return;
      }

      // Tap on any other verse → stop previous, start new.
      if (currentBtn && currentBtn !== btn) {
        setButtonState(currentBtn, "idle");
      }
      if (audio) audio.pause();
      playVerse(btn, s, a);
    }

    function onReciterChange() {
      // Changing reciter mid-playback: stop and let user re-start.
      stopActive();
      if (audio) {
        audio.src = "";
      }
    }

    document.addEventListener("click", onClick);
    window.addEventListener(RECITER_CHANGE_EVENT, onReciterChange);

    return () => {
      stopActive();
      if (audio) audio.src = "";
      audio = null;
      document.removeEventListener("click", onClick);
      window.removeEventListener(RECITER_CHANGE_EVENT, onReciterChange);
    };
  }, []);

  return null;
}
