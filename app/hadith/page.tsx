import {
  COLLECTIONS,
  getAllHadiths,
  getCollectionCounts,
} from "@/lib/hadith";
import { CollectionGrid } from "@/components/CollectionGrid";
import { HadithItem } from "@/components/HadithItem";

export const metadata = {
  title: "Hadith · Sakīna",
  description:
    "Curated authentic narrations from Ṣaḥīḥ al-Bukhārī, Ṣaḥīḥ Muslim, an-Nawawī's 40, and the four Sunan. Every record graded Ṣaḥīḥ or Ḥasan.",
};

export default async function HadithIndexPage() {
  const [hadiths, counts] = await Promise.all([
    getAllHadiths(),
    getCollectionCounts(),
  ]);

  return (
    <div className="page-enter">
      <div className="mb-14 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-2 text-[32px] text-gold"
        >
          ٱلْحَدِيث
        </div>
        <h2
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
        >
          The Authentic Sunnah
        </h2>
        <p className="font-cormorant mx-auto max-w-[520px] text-[18px] italic text-muted">
          {hadiths.length} narrations across {COLLECTIONS.length} collections.
          Every record graded Ṣaḥīḥ or Ḥasan; nothing weaker is shown.
        </p>
      </div>

      <CollectionGrid counts={counts} activeId="all" />

      <div>
        {hadiths.map((h) => (
          <HadithItem key={h.id} hadith={h} />
        ))}
      </div>
    </div>
  );
}
