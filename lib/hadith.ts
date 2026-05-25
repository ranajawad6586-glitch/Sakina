import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Hadith, HadithCollectionId } from "./types";

const DATA_DIR = join(process.cwd(), "data", "hadiths");

export interface CollectionMeta {
  id: HadithCollectionId;
  name_ar: string;
  name_en: string;
}

export const COLLECTIONS: CollectionMeta[] = [
  { id: "bukhari", name_ar: "ٱلْبُخَارِيّ", name_en: "Ṣaḥīḥ al-Bukhārī" },
  { id: "muslim", name_ar: "مُسْلِم", name_en: "Ṣaḥīḥ Muslim" },
  { id: "nawawi40", name_ar: "ٱلنَّوَوِيَّة", name_en: "An-Nawawī's 40" },
  { id: "tirmidhi", name_ar: "ٱلتِّرْمِذِيّ", name_en: "Sunan at-Tirmidhī" },
  { id: "abudawud", name_ar: "أَبُو دَاوُد", name_en: "Sunan Abī Dāwūd" },
  { id: "nasai", name_ar: "ٱلنَّسَائِيّ", name_en: "Sunan an-Nasāʾī" },
  { id: "ibnmajah", name_ar: "ٱبْنُ مَاجَه", name_en: "Sunan Ibn Mājah" },
];

export function isCollectionId(s: string): s is HadithCollectionId {
  return COLLECTIONS.some((c) => c.id === s);
}

export async function getCollection(
  id: HadithCollectionId,
): Promise<Hadith[]> {
  const raw = await readFile(join(DATA_DIR, `${id}.json`), "utf-8");
  return JSON.parse(raw) as Hadith[];
}

export async function getAllHadiths(): Promise<Hadith[]> {
  const all: Hadith[] = [];
  for (const c of COLLECTIONS) {
    all.push(...(await getCollection(c.id)));
  }
  return all;
}

export async function getCollectionCounts(): Promise<
  Record<HadithCollectionId, number>
> {
  const counts = {} as Record<HadithCollectionId, number>;
  for (const c of COLLECTIONS) {
    const items = await getCollection(c.id);
    counts[c.id] = items.length;
  }
  return counts;
}
