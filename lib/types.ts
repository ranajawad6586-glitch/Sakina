export type RevelationType = "meccan" | "medinan";

export interface SurahMeta {
  number: number;
  name_ar: string;
  name_en: string;
  meaning: string;
  verses: number;
  type: RevelationType;
}

export interface Ayah {
  number: number;
  ar: string;
  tl: string;
  en: string;
}

export interface Surah extends SurahMeta {
  bismillah_inline: boolean;
  ayahs: Ayah[];
}

export type HadithCollectionId =
  | "bukhari"
  | "muslim"
  | "nawawi40"
  | "tirmidhi"
  | "abudawud"
  | "nasai"
  | "ibnmajah";

export type HadithGrade = "sahih" | "hasan";

export interface Hadith {
  id: string;
  collection: HadithCollectionId;
  collection_ar: string;
  collection_en: string;
  number: string;
  book?: string;
  ar: string;
  en: string;
  narrator_en?: string;
  narrator_ar?: string;
  grade: HadithGrade;
}
