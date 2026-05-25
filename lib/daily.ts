import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { DailyVerse, Hadith, HadithGrade } from "./types";
import { getAllHadiths } from "./hadith";

/**
 * A trimmed-down hadith record sized for the home page daily card.
 * We ship the whole rotation pool to the client so that day-of-year
 * indexing happens in the browser — otherwise a statically-exported
 * home page would freeze to the build day's selection.
 */
export interface DailyHadithCard {
  id: string;
  collection_en: string;
  number: string;
  ar: string;
  en: string;
  narrator_en: string;
  grade: HadithGrade;
}

/**
 * Day-of-year picker matching the prototype's
 *   Math.floor((Date.now() - new Date(year, 0, 0)) / 86400000)
 * so the rotation lands on the same item if you reopen the page
 * later in the same day, and rolls over precisely at local midnight.
 */
function dayOfYear(date: Date = new Date()): number {
  const yearStart = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - yearStart.getTime()) / 86_400_000);
}

let cachedVerses: DailyVerse[] | null = null;

async function getDailyVersePool(): Promise<DailyVerse[]> {
  if (cachedVerses) return cachedVerses;
  const raw = await readFile(
    join(process.cwd(), "data", "daily-verses.json"),
    "utf-8",
  );
  cachedVerses = JSON.parse(raw) as DailyVerse[];
  return cachedVerses;
}

export async function getDailyVerses(): Promise<DailyVerse[]> {
  return getDailyVersePool();
}

const AR_LIMIT = 220;
const EN_LIMIT = 280;
const ELLIPSIS = "…";

function truncate(s: string, limit: number, keep: number): string {
  return s.length > limit ? s.substring(0, keep) + ELLIPSIS : s;
}

export async function getDailyHadithPool(): Promise<DailyHadithCard[]> {
  const all = await getAllHadiths();
  return all.map((h) => toDailyHadithCard(h));
}

function toDailyHadithCard(h: Hadith): DailyHadithCard {
  return {
    id: h.id,
    collection_en: h.collection_en,
    number: h.number,
    ar: truncate(h.ar, AR_LIMIT, 200),
    en: truncate(h.en, EN_LIMIT, 260),
    narrator_en: h.narrator_en ?? "",
    grade: h.grade,
  };
}
