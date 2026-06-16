"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sakina:last-read";
const CHANGE_EVENT = "sakina:last-read-changed";

export interface LastRead {
  surah: number;
  surah_name_en: string;
  ayah: number;
  /** ms since epoch — used to age stale entries out of the UI. */
  ts: number;
}

export function readLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastRead>;
    if (
      typeof parsed.surah !== "number" ||
      typeof parsed.ayah !== "number" ||
      typeof parsed.surah_name_en !== "string"
    ) {
      return null;
    }
    return {
      surah: parsed.surah,
      surah_name_en: parsed.surah_name_en,
      ayah: parsed.ayah,
      ts: typeof parsed.ts === "number" ? parsed.ts : 0,
    };
  } catch {
    return null;
  }
}

export function writeLastRead(value: LastRead) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // ignore — storage quota / private mode
  }
}

export function useLastRead() {
  const [lr, setLr] = useState<LastRead | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLr(readLastRead());
    setReady(true);
    const refresh = () => setLr(readLastRead());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { lastRead: lr, ready };
}
