"use client";

import { useEffect } from "react";
import { writeLastRead } from "@/lib/last-read";

interface Props {
  surah: number;
  surahName: string;
}

/**
 * Mounted once per surah reader page. Watches each <article id="ayah-N">
 * via IntersectionObserver and records the most-recently-settled verse
 * to localStorage. "Settled" = at least half the verse has been on
 * screen for ~800 ms, which prevents fast-scroll fly-by writes.
 */
export function LastReadTracker({ surah, surahName }: Props) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    let writeTimer: number | null = null;
    let pendingAyah: number | null = null;

    const scheduleWrite = (ayah: number) => {
      pendingAyah = ayah;
      if (writeTimer !== null) clearTimeout(writeTimer);
      writeTimer = window.setTimeout(() => {
        if (pendingAyah !== null) {
          writeLastRead({
            surah,
            surah_name_en: surahName,
            ayah: pendingAyah,
            ts: Date.now(),
          });
        }
      }, 800);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-centered, most-visible entry that's intersecting.
        let best: { ratio: number; ayah: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const m = e.target.id.match(/^ayah-(\d+)$/);
          if (!m) continue;
          const ayah = Number.parseInt(m[1], 10);
          if (!best || e.intersectionRatio > best.ratio) {
            best = { ratio: e.intersectionRatio, ayah };
          }
        }
        if (best) scheduleWrite(best.ayah);
      },
      { threshold: [0.4, 0.7] },
    );

    const verses = document.querySelectorAll<HTMLElement>('[id^="ayah-"]');
    verses.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (writeTimer !== null) clearTimeout(writeTimer);
    };
  }, [surah, surahName]);

  return null;
}
