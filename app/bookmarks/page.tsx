import {
  BookmarksList,
  type HadithListItem,
} from "@/components/BookmarksList";
import { getAllHadiths } from "@/lib/hadith";
import { getAllSurahsMeta } from "@/lib/quran";

export const metadata = {
  title: "Bookmarks · Sakīna",
  description:
    "Your saved verses and hadith — stored only on this device.",
};

export default async function BookmarksPage() {
  const [surahs, allHadiths] = await Promise.all([
    getAllSurahsMeta(),
    getAllHadiths(),
  ]);

  const hadithIndex: HadithListItem[] = allHadiths.map((h) => ({
    id: h.id,
    collection: h.collection,
    collection_en: h.collection_en,
    collection_ar: h.collection_ar,
    number: h.number,
    narrator_en: h.narrator_en ?? "",
    grade: h.grade,
  }));

  return (
    <div className="page-enter">
      <div className="mb-14 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-2 text-[32px] text-gold"
        >
          ٱلْمَوَاقِع
        </div>
        <h2
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
        >
          Bookmarks
        </h2>
        <p className="font-cormorant mx-auto max-w-[520px] text-[18px] italic text-muted">
          Verses and hadith you&rsquo;ve starred. Saved only on this device.
        </p>
      </div>

      <BookmarksList surahs={surahs} hadithIndex={hadithIndex} />
    </div>
  );
}
