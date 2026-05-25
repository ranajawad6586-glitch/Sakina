"use client";

import Link from "next/link";
import { parseVerseKey, useBookmarks } from "@/lib/bookmarks";
import type { SurahMeta } from "@/lib/types";

export interface HadithListItem {
  id: string;
  collection: string;
  collection_en: string;
  collection_ar: string;
  number: string;
  narrator_en: string;
  grade: "sahih" | "hasan";
}

interface Props {
  surahs: SurahMeta[];
  hadithIndex: HadithListItem[];
}

const GRADE_LABEL: Record<"sahih" | "hasan", string> = {
  sahih: "Ṣaḥīḥ",
  hasan: "Ḥasan",
};

export function BookmarksList({ surahs, hadithIndex }: Props) {
  const { ready, verses, hadiths } = useBookmarks();

  const surahLookup = new Map(surahs.map((s) => [s.number, s]));
  const hadithLookup = new Map(hadithIndex.map((h) => [h.id, h]));

  if (!ready) {
    return <div className="h-40" aria-hidden="true" />;
  }

  if (verses.length === 0 && hadiths.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface px-6 py-20 text-center text-muted">
        <div
          dir="rtl"
          className="font-amiri mb-4 text-[36px] text-gold-deep"
        >
          ٱحْفَظْ ٱلْمَوَاقِع
        </div>
        <p className="font-cormorant mx-auto max-w-[480px] text-[19px] italic">
          Tap the star beside any verse or hadith to keep it here. Your
          bookmarks live only on this device — there are no accounts and
          nothing leaves your browser.
        </p>
      </div>
    );
  }

  const versesResolved = verses
    .map((key) => {
      const parsed = parseVerseKey(key);
      if (!parsed) return null;
      const meta = surahLookup.get(parsed.surah);
      if (!meta) return null;
      return { ...parsed, meta };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)
    .sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);

  const hadithsResolved = hadiths
    .map((id) => hadithLookup.get(id))
    .filter((h): h is HadithListItem => Boolean(h));

  return (
    <div className="space-y-12">
      {versesResolved.length > 0 && (
        <section>
          <h3 className="font-cinzel mb-5 text-[14px] uppercase tracking-[0.25em] text-gold">
            Verses · {versesResolved.length}
          </h3>
          <ul className="space-y-2.5">
            {versesResolved.map((v) => (
              <li key={`${v.surah}:${v.ayah}`}>
                <Link
                  href={`/quran/${v.surah}#ayah-${v.ayah}`}
                  className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface px-5 py-4 transition-colors duration-200 hover:border-gold-deep"
                >
                  <div>
                    <div className="font-cinzel text-[14px] text-cream">
                      Sūrah {v.meta.name_en} · {v.surah}:{v.ayah}
                    </div>
                    <div className="font-cormorant text-[14px] italic text-muted">
                      {v.meta.meaning}
                    </div>
                  </div>
                  <div
                    dir="rtl"
                    className="font-amiri text-[22px] text-gold"
                  >
                    {v.meta.name_ar}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hadithsResolved.length > 0 && (
        <section>
          <h3 className="font-cinzel mb-5 text-[14px] uppercase tracking-[0.25em] text-gold">
            Hadith · {hadithsResolved.length}
          </h3>
          <ul className="space-y-2.5">
            {hadithsResolved.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/hadith/${h.collection}#hadith-${h.id}`}
                  className="flex items-center justify-between gap-4 rounded-md border border-line bg-surface px-5 py-4 transition-colors duration-200 hover:border-gold-deep"
                >
                  <div>
                    <div className="font-cinzel text-[14px] text-cream">
                      {h.collection_en} · {h.number}
                    </div>
                    <div className="font-cormorant text-[14px] italic text-muted">
                      {h.narrator_en} · {GRADE_LABEL[h.grade]}
                    </div>
                  </div>
                  <div
                    dir="rtl"
                    className="font-amiri text-[22px] text-gold"
                  >
                    {h.collection_ar}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
