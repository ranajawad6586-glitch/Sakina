"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DailyHadithCard } from "@/lib/daily";
import type { DailyVerse } from "@/lib/types";

interface Props {
  verses: DailyVerse[];
  hadiths: DailyHadithCard[];
}

function dayOfYear(date: Date): number {
  const yearStart = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - yearStart.getTime()) / 86_400_000);
}

const GRADE_LABELS: Record<DailyHadithCard["grade"], string> = {
  sahih: "Ṣaḥīḥ",
  hasan: "Ḥasan",
};

export function DailyCards({ verses, hadiths }: Props) {
  // Day-of-year is computed client-side so a statically-exported page
  // still rotates correctly when the user returns tomorrow.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    setToday(dayOfYear(new Date()));
  }, []);

  if (today === null || verses.length === 0 || hadiths.length === 0) {
    // Height-stable skeleton during SSR / pre-hydration so the labels
    // are present even without JS and the page doesn't jump when the
    // real daily content renders.
    return (
      <div className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DailyCard label="Verse of the Day">
          <div className="h-44" aria-hidden="true" />
        </DailyCard>
        <DailyCard label="Hadith of the Day">
          <div className="h-44" aria-hidden="true" />
        </DailyCard>
      </div>
    );
  }

  const v = verses[today % verses.length];
  const h = hadiths[today % hadiths.length];

  return (
    <div className="mb-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <DailyCard label="Verse of the Day">
        <div
          dir="rtl"
          className="font-amiri mb-6 text-right text-[26px] leading-[1.9] text-cream"
        >
          {v.ar}
        </div>
        <p className="font-cormorant mb-[18px] text-[19px] italic leading-[1.7] text-cream-soft">
          “{v.en}”
        </p>
        <div className="font-cinzel border-t border-line pt-[18px] text-[11px] uppercase tracking-[0.25em] text-gold-deep">
          <Link
            href={`/quran/${v.surah}`}
            className="hover:text-gold transition-colors"
          >
            Sūrah {v.name_en} · {v.ayah_label}
          </Link>
        </div>
      </DailyCard>

      <DailyCard label="Hadith of the Day">
        <div
          dir="rtl"
          className="font-amiri mb-6 text-right text-[26px] leading-[1.9] text-cream"
        >
          {h.ar}
        </div>
        <p className="font-cormorant mb-[18px] text-[19px] italic leading-[1.7] text-cream-soft">
          “{h.en}”
        </p>
        <div className="font-cinzel flex flex-wrap items-center gap-3 border-t border-line pt-[18px] text-[11px] uppercase tracking-[0.25em] text-gold-deep">
          <span>
            {h.collection_en} · {h.number}
          </span>
          <span className="rounded-xl bg-[rgba(74,135,112,0.15)] px-2.5 py-0.5 text-[10px] tracking-[0.15em] text-emerald">
            {GRADE_LABELS[h.grade]}
          </span>
        </div>
      </DailyCard>
    </div>
  );
}

function DailyCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className="relative overflow-hidden rounded-lg border border-line bg-gradient-to-br from-surface to-elevated p-[36px_32px]"
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(212,165,116,0.08), transparent 50%)",
        }}
      />
      <div className="relative">
        <div className="font-cinzel mb-6 inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-gold">
          <span className="block h-px w-6 bg-gold" />
          {label}
        </div>
        {children}
      </div>
    </article>
  );
}
