/**
 * fetch-quran.ts
 *
 * Pulls the Uthmānī Arabic text, Sahih International translation, and
 * transliteration from alquran.cloud and writes one file per surah to
 * data/quran/{nnn}.json + a metadata index at data/surahs.json.
 *
 * Run with:  npx tsx scripts/fetch-quran.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Ayah, Surah, SurahMeta } from "../lib/types";

const ENDPOINTS = {
  arabic: "https://api.alquran.cloud/v1/quran/quran-uthmani",
  english: "https://api.alquran.cloud/v1/quran/en.sahih",
  translit: "https://api.alquran.cloud/v1/quran/en.transliteration",
} as const;

// The alquran.cloud Uthmānī edition uses a specific diacritic
// ordering (shadda-before-fatha) that does NOT match a freshly-typed
// bismillah. Rather than hardcode a literal, we derive the canonical
// bismillah from the API itself — see deriveBismillah() — so we strip
// only what the source actually shipped. (CLAUDE.md §4.8: don't
// normalise the diacritics; match the source exactly.)
//
// U+FEFF (ZWNBSP / BOM) sometimes prefixes surah 1, verse 1.
const ZWNBSP = "﻿";

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

function deriveBismillah(arabicSurahs: AqcSurah[]): string {
  // Surah 1 (Al-Fātiḥah) verse 1 IS the bismillah. Strip the optional
  // U+FEFF prefix and any leading whitespace. This gives us the exact
  // glyphs the API uses, so the strip below matches byte-for-byte.
  const fatihahV1 = arabicSurahs.find((s) => s.number === 1)?.ayahs[0]?.text;
  if (!fatihahV1) {
    throw new Error("Could not find Al-Fātiḥah verse 1 to derive bismillah");
  }
  let canonical = fatihahV1;
  while (canonical.startsWith(ZWNBSP)) canonical = canonical.slice(1);
  return canonical.trim();
}

function stripLeadingBismillah(text: string, bismillah: string): string {
  // Remove optional leading BOM / whitespace, then peel off the exact
  // canonical bismillah if present. Anything else is left alone.
  let head = text;
  while (head.startsWith(ZWNBSP)) head = head.slice(1);
  head = head.trimStart();
  if (head.startsWith(bismillah)) {
    return head.slice(bismillah.length).trimStart();
  }
  return text;
}

async function main(): Promise<void> {
  console.log("Fetching Qur'an editions from alquran.cloud ...");
  const [arabic, english, translit] = await Promise.all([
    fetchJson<AqcResponse>(ENDPOINTS.arabic),
    fetchJson<AqcResponse>(ENDPOINTS.english),
    fetchJson<AqcResponse>(ENDPOINTS.translit),
  ]);

  if (
    arabic.data.surahs.length !== 114 ||
    english.data.surahs.length !== 114 ||
    translit.data.surahs.length !== 114
  ) {
    throw new Error(
      `Expected 114 surahs from each edition, got ` +
        `${arabic.data.surahs.length}/${english.data.surahs.length}/${translit.data.surahs.length}`,
    );
  }

  const outDir = join(process.cwd(), "data", "quran");
  await mkdir(outDir, { recursive: true });

  const BISMILLAH = deriveBismillah(arabic.data.surahs);
  console.log(`Canonical bismillah glyphs derived (${BISMILLAH.length} chars).`);

  const metaIndex: SurahMeta[] = [];
  let totalAyahs = 0;

  for (let i = 0; i < 114; i++) {
    const aSurah = arabic.data.surahs[i];
    const eSurah = english.data.surahs[i];
    const tSurah = translit.data.surahs[i];

    if (
      aSurah.number !== eSurah.number ||
      aSurah.number !== tSurah.number ||
      aSurah.ayahs.length !== eSurah.ayahs.length ||
      aSurah.ayahs.length !== tSurah.ayahs.length
    ) {
      throw new Error(
        `Surah ${aSurah.number} ayah-count mismatch between editions: ` +
          `${aSurah.ayahs.length}/${eSurah.ayahs.length}/${tSurah.ayahs.length}`,
      );
    }

    const surahNumber = aSurah.number;
    const isFatihah = surahNumber === 1;
    const isTawbah = surahNumber === 9;
    const bismillahInline = isFatihah;

    const ayahs: Ayah[] = aSurah.ayahs.map((a, idx) => {
      let arText = a.text;

      // Strip the prepended bismillah on verse 1 of every surah other
      // than Al-Fātiḥah (where it IS the verse) and At-Tawbah (which
      // has no bismillah at all).
      if (idx === 0 && !isFatihah && !isTawbah) {
        arText = stripLeadingBismillah(arText, BISMILLAH);
      } else if (idx === 0 && isFatihah) {
        // Strip the optional U+FEFF prefix from Al-Fātiḥah verse 1.
        while (arText.startsWith(ZWNBSP)) arText = arText.slice(1);
      }

      return {
        number: a.numberInSurah,
        ar: arText,
        tl: tSurah.ayahs[idx].text,
        en: eSurah.ayahs[idx].text,
      };
    });

    const surah: Surah = {
      number: surahNumber,
      name_ar: aSurah.name,
      name_en: aSurah.englishName,
      meaning: aSurah.englishNameTranslation,
      verses: ayahs.length,
      type: aSurah.revelationType.toLowerCase() as "meccan" | "medinan",
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

    const outPath = join(outDir, `${pad3(surahNumber)}.json`);
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
    `OK — wrote 114 surah files + surahs.json, total ${totalAyahs} ayahs.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
