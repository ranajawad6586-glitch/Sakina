import { Ornament } from "@/components/Ornament";

export const metadata = {
  title: "About · Sakīna",
  description:
    "On the data sources, typography, and intentions behind Sakīna.",
};

export default function AboutPage() {
  return (
    <div className="page-enter mx-auto max-w-[720px]">
      <div className="mb-14 text-center">
        <div
          dir="rtl"
          className="font-amiri mb-2 text-[32px] text-gold"
        >
          عَنِ ٱلتَّطْبِيق
        </div>
        <h2
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(32px, 4.5vw, 44px)" }}
        >
          About Sakīna
        </h2>
        <Ornament className="mt-4" />
      </div>

      <section className="mb-12 rounded-lg border border-line bg-surface p-8 text-left">
        <h3 className="font-cinzel mb-4 text-[17px] uppercase tracking-[0.15em] text-gold">
          Authenticity
        </h3>
        <p className="font-cormorant mb-3 leading-[1.75] text-cream-soft">
          The Qur&rsquo;an is rendered in the Uthmānī script, pulled from
          Tanzil via alquran.cloud — diacritics preserved byte-for-byte.
          The translation is Sahih International. Transliteration is the
          standard romanisation included in the same source.
        </p>
        <p className="font-cormorant leading-[1.75] text-cream-soft">
          Every hadith carries its collection, number, narrator, and grade
          (Ṣaḥīḥ or Ḥasan). For Tirmidhī, Abū Dāwūd, Nasāʾī, and Ibn Mājah
          we apply Al-Albānī&rsquo;s gradings from the source and drop any
          narration weaker than Ḥasan. Nothing ḍaʿīf or mawḍūʿ is shown.
        </p>
      </section>

      <section className="mb-12 rounded-lg border border-line bg-surface p-8 text-left">
        <h3 className="font-cinzel mb-4 text-[17px] uppercase tracking-[0.15em] text-gold">
          Typography
        </h3>
        <p className="font-cormorant leading-[1.75] text-cream-soft">
          Three serif faces carry the entire interface: Amiri for Arabic,
          Cinzel for display, and Cormorant Garamond for body. No sans
          serif. No system font. No fourth typeface.
        </p>
      </section>

      <section className="mb-12 rounded-lg border border-line bg-surface p-8 text-left">
        <h3 className="font-cinzel mb-4 text-[17px] uppercase tracking-[0.15em] text-gold">
          How to use this
        </h3>
        <p className="font-cormorant leading-[1.75] text-cream-soft">
          Slowly. There are no streaks, no notifications, no leaderboards.
          Read a single verse. Sit with a single hadith. Close the tab.
        </p>
      </section>
    </div>
  );
}
