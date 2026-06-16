import { ContinueReadingCard } from "@/components/ContinueReadingCard";
import { getAllSurahsMeta } from "@/lib/quran";
import { SurahList } from "@/components/SurahList";

export const metadata = {
  title: "The Surahs",
  description:
    "All 114 surahs of the Qur'an. Search by name, meaning, or number; filter by Meccan or Medinan revelation.",
};

export default async function QuranIndexPage() {
  const surahs = await getAllSurahsMeta();

  return (
    <div className="page-enter">
      <div className="mb-14 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-2 text-[32px] text-gold"
        >
          سُورَة
        </div>
        <h2
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
        >
          The Surahs
        </h2>
        <p className="font-cormorant mx-auto max-w-[520px] text-[18px] italic text-muted">
          114 chapters revealed over twenty-three years. Tap any surah to
          read.
        </p>
      </div>

      <ContinueReadingCard />

      <SurahList surahs={surahs} />
    </div>
  );
}
