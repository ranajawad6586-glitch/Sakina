import { BookmarkButton } from "@/components/BookmarkButton";
import type { Hadith } from "@/lib/types";

const GRADE_LABELS: Record<Hadith["grade"], string> = {
  sahih: "Ṣaḥīḥ — Authentic",
  hasan: "Ḥasan — Sound",
};

const GRADE_PILL: Record<Hadith["grade"], string> = {
  sahih:
    "border border-[rgba(74,135,112,0.3)] bg-[rgba(74,135,112,0.15)] text-emerald",
  hasan:
    "border border-[rgba(212,165,116,0.3)] bg-[rgba(212,165,116,0.12)] text-gold",
};

export function HadithItem({ hadith }: { hadith: Hadith }) {
  const first = hadith.en.charAt(0);
  const rest = hadith.en.slice(1);
  const sourceLabel = `${hadith.collection_en} ${hadith.number}`;

  return (
    <article
      id={`hadith-${hadith.id}`}
      className="mb-5 rounded-md border border-line border-l-[3px] border-l-gold bg-surface p-[32px_36px] transition-colors duration-300 hover:border-gold-deep hover:border-l-gold-bright scroll-mt-24"
    >
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="font-cinzel text-[12px] uppercase tracking-[0.2em] text-gold">
          Hadith № {hadith.number}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`font-cinzel rounded-xl px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${GRADE_PILL[hadith.grade]}`}
          >
            {GRADE_LABELS[hadith.grade]}
          </span>
          <BookmarkButton kind="hadith" id={hadith.id} />
        </div>
      </header>

      <div
        dir="rtl"
        className="font-amiri mb-6 px-1 text-right text-[24px] leading-[2] text-cream"
      >
        {hadith.ar}
      </div>

      <div className="font-cormorant mb-4 text-[18px] leading-[1.75] text-cream-soft">
        <span className="font-cinzel float-left pr-2.5 pt-1 text-[42px] leading-none text-gold">
          {first}
        </span>
        {rest}
      </div>

      <div className="clear-both font-cormorant border-t border-line-soft pt-4 text-[15px] italic text-muted">
        <strong className="not-italic font-medium text-gold-deep">
          {hadith.narrator_en}
        </strong>{" "}
        · {sourceLabel}
      </div>
    </article>
  );
}
