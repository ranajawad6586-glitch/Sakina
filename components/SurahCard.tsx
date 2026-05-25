import Link from "next/link";
import type { SurahMeta } from "@/lib/types";

export function SurahCard({ surah }: { surah: SurahMeta }) {
  const typeLabel = surah.type === "meccan" ? "Meccan" : "Medinan";
  return (
    <Link
      href={`/quran/${surah.number}`}
      className="group relative flex items-center gap-[18px] rounded-lg border border-line bg-surface p-[22px_20px] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-deep hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 50 50"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <polygon
            points="25,2 48,25 25,48 2,25"
            fill="none"
            stroke="#d4a574"
            strokeWidth="1"
          />
        </svg>
        <span className="font-cinzel text-[15px] text-gold">
          {surah.number}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-cinzel text-[17px] font-medium tracking-[0.02em] text-cream">
          {surah.name_en}
        </div>
        <div className="font-cormorant text-[14px] italic text-muted">
          {surah.meaning} · {surah.verses} verses · {typeLabel}
        </div>
      </div>

      <div
        dir="rtl"
        className="font-amiri text-[26px] leading-none text-gold"
      >
        {surah.name_ar}
      </div>
    </Link>
  );
}
