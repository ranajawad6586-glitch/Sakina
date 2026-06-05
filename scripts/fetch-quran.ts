/**
 * fetch-quran.ts
 *
 * Pulls three Qur'an editions and merges them into per-surah JSON
 * files under data/quran/ plus a data/surahs.json metadata index.
 *
 * - Arabic: IndoPak script (the script most Pakistani readers grew up
 *   with — uses small-high-jeem sukūn ۡ instead of the round ْ , no
 *   alef-wasla ٱ , and اللّٰه instead of ٱللَّه). Sourced from the
 *   fawazahmed0/quran-api mirror of King Fahd Quran Complex.
 * - English: Sahih International (alquran.cloud / Tanzil).
 * - Transliteration: standard romanisation (alquran.cloud / Tanzil).
 *
 * Run with:  npx tsx scripts/fetch-quran.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Ayah, RevelationType, Surah, SurahMeta } from "../lib/types";

const ENDPOINTS = {
  arabic:
    "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions/ara-quranindopak.min.json",
  english: "https://api.alquran.cloud/v1/quran/en.sahih",
  translit: "https://api.alquran.cloud/v1/quran/en.transliteration",
} as const;

// The IndoPak edition's bismillah, as emitted by the source. Derived
// from surah 1 verse 1 below; non-Fātiḥah, non-Tawbah surahs are
// inspected for this prefix on verse 1 so the reader can render it
// once as a header instead of inline (matches the printed Mushaf).
const ZWNBSP = "﻿";

interface IndoPakAyah {
  chapter: number;
  verse: number;
  text: string;
}

interface IndoPakDoc {
  quran: IndoPakAyah[];
}

interface AqcAyah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface AqcSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  ayahs: AqcAyah[];
}

interface AqcResponse {
  code: number;
  status: string;
  data: { surahs: AqcSurah[] };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

function stripLeadingBismillah(text: string, bismillah: string): string {
  let head = text;
  while (head.startsWith(ZWNBSP)) head = head.slice(1);
  head = head.trimStart();
  if (head.startsWith(bismillah)) {
    return head.slice(bismillah.length).trimStart();
  }
  return text;
}

function groupBySurah(ayahs: IndoPakAyah[]): Map<number, IndoPakAyah[]> {
  const out = new Map<number, IndoPakAyah[]>();
  for (const a of ayahs) {
    let bucket = out.get(a.chapter);
    if (!bucket) {
      bucket = [];
      out.set(a.chapter, bucket);
    }
    bucket.push(a);
  }
  for (const bucket of out.values()) {
    bucket.sort((a, b) => a.verse - b.verse);
  }
  return out;
}

async function main(): Promise<void> {
  console.log("Fetching IndoPak Qur'an + English editions ...");
  const [indo, english, translit] = await Promise.all([
    fetchJson<IndoPakDoc>(ENDPOINTS.arabic),
    fetchJson<AqcResponse>(ENDPOINTS.english),
    fetchJson<AqcResponse>(ENDPOINTS.translit),
  ]);

  if (indo.quran.length !== 6236) {
    throw new Error(
      `IndoPak edition has ${indo.quran.length} ayahs, expected 6236`,
    );
  }
  if (
    english.data.surahs.length !== 114 ||
    translit.data.surahs.length !== 114
  ) {
    throw new Error(
      `Expected 114 surahs from each English edition, got ` +
        `${english.data.surahs.length}/${translit.data.surahs.length}`,
    );
  }

  const indoBySurah = groupBySurah(indo.quran);

  // Derive the canonical bismillah from the IndoPak source itself
  // (Al-Fātiḥah verse 1 IS the bismillah).
  const fatihahV1 = indoBySurah.get(1)?.[0]?.text;
  if (!fatihahV1) {
    throw new Error("Could not find Al-Fātiḥah verse 1 to derive bismillah");
  }
  let BISMILLAH = fatihahV1;
  while (BISMILLAH.startsWith(ZWNBSP)) BISMILLAH = BISMILLAH.slice(1);
  BISMILLAH = BISMILLAH.trim();
  console.log(`Canonical IndoPak bismillah derived (${BISMILLAH.length} chars).`);

  const outDir = join(process.cwd(), "data", "quran");
  await mkdir(outDir, { recursive: true });

  const metaIndex: SurahMeta[] = [];
  let totalAyahs = 0;

  for (let n = 1; n <= 114; n++) {
    const indoAyahs = indoBySurah.get(n) ?? [];
    const eSurah = english.data.surahs[n - 1];
    const tSurah = translit.data.surahs[n - 1];

    if (
      indoAyahs.length !== eSurah.ayahs.length ||
      indoAyahs.length !== tSurah.ayahs.length
    ) {
      throw new Error(
        `Surah ${n} ayah-count mismatch between editions: ` +
          `${indoAyahs.length}/${eSurah.ayahs.length}/${tSurah.ayahs.length}`,
      );
    }

    const isFatihah = n === 1;
    const isTawbah = n === 9;
    const bismillahInline = isFatihah;

    const ayahs: Ayah[] = indoAyahs.map((a, idx) => {
      let arText = a.text;
      if (idx === 0 && !isFatihah && !isTawbah) {
        arText = stripLeadingBismillah(arText, BISMILLAH);
      } else if (idx === 0 && isFatihah) {
        while (arText.startsWith(ZWNBSP)) arText = arText.slice(1);
      }
      return {
        number: a.verse,
        ar: arText,
        tl: tSurah.ayahs[idx].text,
        en: eSurah.ayahs[idx].text,
      };
    });

    const surah: Surah = {
      number: n,
      name_ar: eSurah.name,
      name_en: eSurah.englishName,
      meaning: eSurah.englishNameTranslation,
      verses: ayahs.length,
      type: eSurah.revelationType.toLowerCase() as RevelationType,
      bismillah_inline: bismillahInline,
      ayahs,
    };

    metaIndex.push({
      number: surah.number,
      name_ar: surah.name_ar,
      name_en: surah.name_en,
      meaning: surah.meaning,
      verses: surah.verses,
      type: surah.type,
    });

    totalAyahs += ayahs.length;

    const outPath = join(outDir, `${pad3(n)}.json`);
    await writeFile(outPath, `${JSON.stringify(surah, null, 2)}\n`, "utf-8");
  }

  const metaPath = join(process.cwd(), "data", "surahs.json");
  await writeFile(metaPath, `${JSON.stringify(metaIndex, null, 2)}\n`, "utf-8");

  // Acceptance checks per CLAUDE.md §6.1
  const errors: string[] = [];
  if (metaIndex.length !== 114) {
    errors.push(`surahs.json has ${metaIndex.length} entries, expected 114`);
  }
  if (totalAyahs !== 6236) {
    errors.push(`Total ayahs = ${totalAyahs}, expected 6236`);
  }
  const surah1 = metaIndex.find((s) => s.number === 1);
  if (surah1?.verses !== 7) errors.push(`Surah 1 has ${surah1?.verses} ayahs, expected 7`);
  const surah2 = metaIndex.find((s) => s.number === 2);
  if (surah2?.verses !== 286) errors.push(`Surah 2 has ${surah2?.verses} ayahs, expected 286`);
  const surah114 = metaIndex.find((s) => s.number === 114);
  if (surah114?.verses !== 6) errors.push(`Surah 114 has ${surah114?.verses} ayahs, expected 6`);

  if (errors.length > 0) {
    console.error("ACCEPTANCE CHECKS FAILED:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `OK — wrote 114 surah files + surahs.json, total ${totalAyahs} ayahs (IndoPak Arabic).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
