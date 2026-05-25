import { Ornament } from "@/components/Ornament";

export default function HomePage() {
  return (
    <div className="page-enter">
      <section className="px-2 pb-20 pt-10 text-center">
        <Ornament className="mb-7" />

        <p
          dir="rtl"
          className="font-amiri mb-4 font-normal leading-[1.4] text-gold-bright"
          style={{
            fontSize: "clamp(36px, 5vw, 58px)",
            textShadow: "0 0 40px rgba(212, 165, 116, 0.2)",
          }}
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        <p className="font-cinzel mb-12 text-[13px] uppercase tracking-[0.3em] text-muted">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>

        <h1
          className="font-cinzel mb-[14px] font-medium tracking-[0.04em] text-cream"
          style={{ fontSize: "clamp(38px, 6vw, 64px)" }}
        >
          Sakīna
        </h1>

        <p
          className="font-cormorant mx-auto max-w-[580px] italic text-cream-soft"
          style={{ fontSize: "clamp(18px, 2.2vw, 22px)" }}
        >
          A quiet place to read the Qur&rsquo;an and walk with the authentic
          Sunnah of the Messenger of Allah ﷺ.
        </p>
      </section>
    </div>
  );
}
