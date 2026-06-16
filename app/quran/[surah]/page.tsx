import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSurahsMeta, getSurah } from "@/lib/quran";
import { LastReadTracker } from "@/components/LastReadTracker";
import { ReciterPicker } from "@/components/ReciterPicker";
import { VerseBlock } from "@/components/VerseBlock";

export async function generateStaticParams() {
  const surahs = await getAllSurahsMeta();
  return surahs.map((s) => ({ surah: String(s.number) }));
}

interface Params {
  params: Promise<{ surah: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { surah } = await params;
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    return { title: "Surah" };
  }
  const s = await getSurah(n);
  return {
    title: `Sūrah ${s.name_en}`,
    description: `${s.meaning} — ${s.verses} verses, ${
      s.type === "meccan" ? "revealed in Makkah" : "revealed in Madīnah"
    }. Arabic with Sahih International translation and transliteration.`,
  };
}

export default async function SurahReaderPage({ params }: Params) {
  const { surah: surahParam } = await params;
  const n = Number(surahParam);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    notFound();
  }

  const s = await getSurah(n);
  const showBismillahHeader = !s.bismillah_inline && s.number !== 9;
  const typeLabel = s.type === "meccan" ? "Meccan" : "Medinan";

  return (
    <div className="page-enter">
      <Link
        href="/quran"
        className="font-cinzel mb-8 inline-flex items-center gap-2.5 py-2.5 text-[12px] uppercase tracking-[0.25em] text-muted transition-colors duration-200 hover:text-gold"
      >
        ← Back to all surahs
      </Link>

      <header className="relative mb-12 border-b border-line pb-12 pt-8 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-[18px] leading-none text-gold-bright"
          style={{
            fontSize: "clamp(56px, 8vw, 80px)",
            textShadow: "0 0 30px rgba(212,165,116,0.15)",
          }}
        >
          {s.name_ar}
        </div>
        <div className="font-cinzel mb-2 text-[28px] tracking-[0.1em] text-cream">
          {s.name_en}
        </div>
        <div className="font-cormorant mb-3.5 text-[18px] italic text-muted">
          {s.meaning}
        </div>
        <div className="font-cinzel inline-flex gap-6 text-[11px] uppercase tracking-[0.2em] text-gold-deep">
          <span>Surah {s.number}</span>
          <span>{s.verses} Verses</span>
          <span>{typeLabel}</span>
        </div>
        <div>
          <ReciterPicker />
        </div>
      </header>

      {showBismillahHeader && (
        <div
          dir="rtl"
          className="font-amiri mb-14 text-center text-[36px] leading-[1.6] text-gold"
        >
          بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ
        </div>
      )}

      <div>
        {s.ayahs.map((a) => (
          <VerseBlock key={a.number} ayah={a} surah={s.number} />
        ))}
      </div>

      <LastReadTracker surah={s.number} surahName={s.name_en} />
    </div>
  );
}
