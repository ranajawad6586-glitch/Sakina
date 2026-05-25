import Link from "next/link";
import { notFound } from "next/navigation";
import {
  COLLECTIONS,
  getCollection,
  getCollectionCounts,
  isCollectionId,
} from "@/lib/hadith";
import { CollectionGrid } from "@/components/CollectionGrid";
import { HadithItem } from "@/components/HadithItem";

export async function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ collection: c.id }));
}

interface Params {
  params: Promise<{ collection: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { collection } = await params;
  if (!isCollectionId(collection)) return { title: "Hadith · Sakīna" };
  const meta = COLLECTIONS.find((c) => c.id === collection);
  return {
    title: `${meta?.name_en} · Sakīna`,
    description: `Curated narrations from ${meta?.name_en}. Every record graded Ṣaḥīḥ or Ḥasan.`,
  };
}

export default async function HadithCollectionPage({ params }: Params) {
  const { collection } = await params;
  if (!isCollectionId(collection)) notFound();

  const [items, counts] = await Promise.all([
    getCollection(collection),
    getCollectionCounts(),
  ]);
  const meta = COLLECTIONS.find((c) => c.id === collection);

  return (
    <div className="page-enter">
      <Link
        href="/hadith"
        className="font-cinzel mb-8 inline-flex items-center gap-2.5 py-2.5 text-[12px] uppercase tracking-[0.25em] text-muted transition-colors duration-200 hover:text-gold"
      >
        ← All collections
      </Link>

      <div className="mb-14 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-2 text-[32px] text-gold"
        >
          {meta?.name_ar}
        </div>
        <h2
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
        >
          {meta?.name_en}
        </h2>
        <p className="font-cormorant mx-auto max-w-[520px] text-[18px] italic text-muted">
          {items.length} narrations in this reader.
        </p>
      </div>

      <CollectionGrid counts={counts} activeId={collection} />

      <div>
        {items.map((h) => (
          <HadithItem key={h.id} hadith={h} />
        ))}
      </div>
    </div>
  );
}
