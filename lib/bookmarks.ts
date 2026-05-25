"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sakina:bookmarks";

export interface VerseBookmark {
  surah: number;
  ayah: number;
}

export interface HadithBookmark {
  id: string;
}

interface Stored {
  verses: string[]; // "surah:ayah"
  hadiths: string[]; // hadith id
}

function emptyStore(): Stored {
  return { verses: [], hadiths: [] };
}

function readStore(): Stored {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      verses: Array.isArray(parsed.verses) ? parsed.verses : [],
      hadiths: Array.isArray(parsed.hadiths) ? parsed.hadiths : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(s: Stored) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  // Notify other components in the same tab.
  window.dispatchEvent(new CustomEvent("sakina:bookmarks-changed"));
}

export function verseKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function parseVerseKey(key: string): VerseBookmark | null {
  const [s, a] = key.split(":");
  const surah = Number(s);
  const ayah = Number(a);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return null;
  return { surah, ayah };
}

/**
 * Hook backing the bookmark UI on individual verses and hadiths.
 * `ready` flips to true after the first localStorage read so we can
 * suppress the toggle UI during SSR and avoid a hydration flicker.
 */
export function useBookmarks() {
  const [store, setStore] = useState<Stored>(emptyStore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setReady(true);

    const refresh = () => setStore(readStore());
    window.addEventListener("sakina:bookmarks-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sakina:bookmarks-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const hasVerse = useCallback(
    (surah: number, ayah: number) => store.verses.includes(verseKey(surah, ayah)),
    [store.verses],
  );

  const hasHadith = useCallback(
    (id: string) => store.hadiths.includes(id),
    [store.hadiths],
  );

  const toggleVerse = useCallback((surah: number, ayah: number) => {
    const key = verseKey(surah, ayah);
    const current = readStore();
    const next: Stored = {
      ...current,
      verses: current.verses.includes(key)
        ? current.verses.filter((k) => k !== key)
        : [...current.verses, key],
    };
    writeStore(next);
    setStore(next);
  }, []);

  const toggleHadith = useCallback((id: string) => {
    const current = readStore();
    const next: Stored = {
      ...current,
      hadiths: current.hadiths.includes(id)
        ? current.hadiths.filter((h) => h !== id)
        : [...current.hadiths, id],
    };
    writeStore(next);
    setStore(next);
  }, []);

  return {
    ready,
    verses: store.verses,
    hadiths: store.hadiths,
    hasVerse,
    hasHadith,
    toggleVerse,
    toggleHadith,
  };
}
