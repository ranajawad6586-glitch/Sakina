/**
 * Yūsuf 12:64 — "But Allah is the best Guardian, and He is the most
 * Merciful of the merciful." (Sahih International)
 */
export function Footer() {
  return (
    <footer className="relative z-[1] mt-10 border-t border-line px-5 pb-10 pt-14 text-center text-muted">
      <div
        dir="rtl"
        className="font-amiri mb-2.5 text-[20px] text-gold"
      >
        فَٱللَّهُ خَيْرٌ حَٰفِظًا ۖ وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ
      </div>
      <p className="font-cormorant text-[16px] italic">
        “But Allah is the best Guardian, and He is the most Merciful of
        the merciful.” · Sūrah Yūsuf 12:64
      </p>
    </footer>
  );
}
