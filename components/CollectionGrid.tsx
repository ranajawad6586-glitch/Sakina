import Link from "next/link";
import { COLLECTIONS, type CollectionMeta } from "@/lib/hadith";
import type { HadithCollectionId } from "@/lib/types";

interface Props {
  counts: Record<HadithCollectionId, number>;
  activeId: HadithCollectionId | "all";
}

interface CardData {
  id: HadithCollectionId | "all";
  name_ar: string;
  name_en: string;
  count: number;
  href: string;
}

export function CollectionGrid({ counts, activeId }: Props) {
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const cards: CardData[] = [
    { id: "all", name_ar: "ٱلْكُلّ", name_en: "All", count: allCount, href: "/hadith" },
    ...COLLECTIONS.map((c: CollectionMeta) => ({
      id: c.id,
      name_ar: c.name_ar,
      name_en: c.name_en,
      count: counts[c.id] ?? 0,
      href: `/hadith/${c.id}`,
    })),
  ];

  return (
    <div className="mb-14 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      {cards.map((c) => {
        const isActive = c.id === activeId;
        return (
          <Link
            key={c.id}
            href={c.href}
            className={`rounded-lg border p-[24px_20px] text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-deep ${
              isActive
                ? "border-gold bg-gradient-to-br from-surface to-elevated"
                : "border-line bg-surface"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <div
              dir="rtl"
              className="font-amiri mb-2.5 text-[26px] text-gold"
            >
              {c.name_ar}
            </div>
            <div className="font-cinzel mb-1.5 text-[14px] tracking-[0.1em] text-cream">
              {c.name_en}
            </div>
            <div className="font-cormorant text-[13px] italic text-muted">
              {c.count} in this reader
            </div>
          </Link>
        );
      })}
    </div>
  );
}
