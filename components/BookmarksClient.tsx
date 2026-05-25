"use client";

import { useEffect } from "react";

const STORAGE_KEY = "sakina:bookmarks";
const CHANGE_EVENT = "sakina:bookmarks-changed";

interface Stored {
  verses: string[];
  hadiths: string[];
}

function readStore(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { verses: [], hadiths: [] };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      verses: Array.isArray(parsed.verses) ? parsed.verses : [],
      hadiths: Array.isArray(parsed.hadiths) ? parsed.hadiths : [],
    };
  } catch {
    return { verses: [], hadiths: [] };
  }
}

function writeStore(s: Stored) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function syncDom(store: Stored) {
  const versesSet = new Set(store.verses);
  const hadithsSet = new Set(store.hadiths);

  document
    .querySelectorAll<HTMLElement>("[data-bookmark-verse]")
    .forEach((el) => {
      const key = el.getAttribute("data-bookmark-verse") ?? "";
      const active = versesSet.has(key);
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
      el.setAttribute("title", active ? "Remove bookmark" : "Add bookmark");
    });

  document
    .querySelectorAll<HTMLElement>("[data-bookmark-hadith]")
    .forEach((el) => {
      const key = el.getAttribute("data-bookmark-hadith") ?? "";
      const active = hadithsSet.has(key);
      el.classList.toggle("is-active", active);
      el.setAttribute("aria-pressed", String(active));
      el.setAttribute("title", active ? "Remove bookmark" : "Add bookmark");
    });
}

function toggleKey(arr: string[], key: string): string[] {
  return arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
}

/**
 * Single page-level controller for every bookmark star button on the
 * page. Event delegation means we don't pay React-hydration cost per
 * verse/hadith — there are no per-button client components anywhere.
 */
export function BookmarksClient() {
  useEffect(() => {
    syncDom(readStore());

    const onClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest<HTMLElement>(
        "[data-bookmark-verse], [data-bookmark-hadith]",
      );
      if (!btn) return;
      e.preventDefault();

      const verseKey = btn.getAttribute("data-bookmark-verse");
      const hadithKey = btn.getAttribute("data-bookmark-hadith");
      const current = readStore();
      const next: Stored = verseKey
        ? { ...current, verses: toggleKey(current.verses, verseKey) }
        : hadithKey
          ? { ...current, hadiths: toggleKey(current.hadiths, hadithKey) }
          : current;
      writeStore(next);
      syncDom(next);
    };

    const onExternalChange = () => syncDom(readStore());

    document.addEventListener("click", onClick);
    window.addEventListener("storage", onExternalChange);
    window.addEventListener(CHANGE_EVENT, onExternalChange);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("storage", onExternalChange);
      window.removeEventListener(CHANGE_EVENT, onExternalChange);
    };
  }, []);

  return null;
}
