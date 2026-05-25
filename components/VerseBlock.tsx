import { BookmarkButton } from "@/components/BookmarkButton";
import type { Ayah } from "@/lib/types";

export function VerseBlock({ ayah, surah }: { ayah: Ayah; surah: number }) {
  return (
    <article
      id={`ayah-${ayah.number}`}
      className="mb-11 border-b border-dashed border-line-soft pb-9 last:mb-0 last:border-b-0 last:pb-0 scroll-mt-24"
    >
      <div
        dir="rtl"
        className="font-amiri mb-5 text-right font-normal text-cream"
        style={{ fontSize: "30px", lineHeight: 2.2 }}
      >
        {ayah.ar}{" "}
        <span
          className="font-cinzel mx-2 inline-flex h-9 w-9 items-center justify-center text-[12px] text-gold align-middle"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><polygon points='20,2 38,20 20,38 2,20' fill='none' stroke='%23d4a574' stroke-width='1'/></svg>\")",
            backgroundPosition: "center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        >
          {ayah.number}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-end">
        <BookmarkButton kind="verse" surah={surah} ayah={ayah.number} />
      </div>

      <div className="font-cinzel mb-1.5 block text-[9px] uppercase tracking-[0.3em] text-muted">
        Transliteration
      </div>
      <div className="font-cormorant mb-3.5 text-[16px] italic text-gold-deep">
        {ayah.tl}
      </div>

      <div className="font-cinzel mb-1.5 block text-[9px] uppercase tracking-[0.3em] text-muted">
        Translation · Sahih International
      </div>
      <div className="font-cormorant text-[19px] leading-[1.75] text-cream-soft">
        {ayah.en}
      </div>
    </article>
  );
}
