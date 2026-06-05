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
 * Single page-level audio controller. There is only one <audio>
 * element on the page at a time — clicking a new verse stops the
 * previous one (matches the "stillness" UX in CLAUDE.md). No
 * autoplay, no chain-playback; the user always initiates.
 */
export function AudioController() {
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let currentBtn: HTMLElement | null = null;

    const stop = () => {
      if (audio) {
        audio.pause();
        audio.src = "";
        audio = null;
      }
      if (currentBtn) {
        setButtonState(currentBtn, "idle");
        currentBtn = null;
      }
    };

    const onClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>("[data-verse-audio]");
      if (!btn) return;
      e.preventDefault();

      const key = btn.getAttribute("data-verse-audio") || "";
      const [s, a] = key.split(":").map((x) => Number.parseInt(x, 10));
      if (!Number.isFinite(s) || !Number.isFinite(a)) return;

      // Clicking the currently-playing verse → stop.
      if (currentBtn === btn && audio && !audio.paused) {
        stop();
        return;
      }

      // Any other click → stop the previous and start the new.
      stop();
      currentBtn = btn;
      setButtonState(btn, "loading");

      const reciter = readReciter();
      const url = audioUrl(reciter, s, a);
      audio = new Audio(url);
      audio.preload = "auto";
      audio.addEventListener("playing", () => {
        if (currentBtn === btn) setButtonState(btn, "playing");
      });
      audio.addEventListener("ended", () => {
        if (currentBtn === btn) {
          setButtonState(btn, "idle");
          audio = null;
          currentBtn = null;
        }
      });
      audio.addEventListener("error", () => {
        if (currentBtn === btn) {
          setButtonState(btn, "idle");
          btn.setAttribute("title", "Recitation unavailable");
          audio = null;
          currentBtn = null;
        }
      });
      audio.play().catch(() => {
        // Browser blocked playback (no user gesture, autoplay policy, etc.)
        setButtonState(btn, "idle");
      });
    };

    const onReciterChange = () => {
      // If something is playing when the user switches reciter, stop
      // it — next play will use the new reciter.
      stop();
    };

    document.addEventListener("click", onClick);
    window.addEventListener(RECITER_CHANGE_EVENT, onReciterChange);

    return () => {
      stop();
      document.removeEventListener("click", onClick);
      window.removeEventListener(RECITER_CHANGE_EVENT, onReciterChange);
    };
  }, []);

  return null;
}
