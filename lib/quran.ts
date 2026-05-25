import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Surah, SurahMeta } from "./types";

const DATA_DIR = join(process.cwd(), "data");

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export async function getAllSurahsMeta(): Promise<SurahMeta[]> {
  const raw = await readFile(join(DATA_DIR, "surahs.json"), "utf-8");
  return JSON.parse(raw) as SurahMeta[];
}

export async function getSurah(n: number): Promise<Surah> {
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    throw new Error(`Invalid surah number: ${n}`);
  }
  const raw = await readFile(
    join(DATA_DIR, "quran", `${pad3(n)}.json`),
    "utf-8",
  );
  return JSON.parse(raw) as Surah;
}
