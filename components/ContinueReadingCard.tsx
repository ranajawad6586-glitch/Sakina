"use client";

import Link from "next/link";
import { useLastRead } from "@/lib/last-read";

/**
 * Renders a "Continue reading" callout linking back to the user's
 * last-settled ayah. Pure client component — returns nothing on the
 * server / before hydration / when no last-read entry exists, so it
 * never displaces layout.
 */
export function ContinueReadingCard() {
  const { lastRead, ready } = useLastRead();
  if (!ready || !lastRead) return null;

  return (
    <Link
      href={`/quran/${lastRead.surah}#ayah-${lastRead.ayah}`}
      className="mb-10 flex items-center justify-between gap-4 rounded-lg border border-line bg-gradient-to-br from-surface to-elevated px-6 py-5 transition-colors duration-300 hover:border-gold-deep"
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)" }}
      aria-label={`Continue reading Sūrah ${lastRead.surah_name_en} from verse ${lastRead.ayah}`}
    >
      <div>
        <div className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-gold">
          Continue reading
        </div>
        <div className="font-cormorant mt-1.5 text-[20px] text-cream">
          Sūrah {lastRead.surah_name_en} ·{" "}
          <span className="text-gold-deep">verse {lastRead.ayah}</span>
        </div>
      </div>
      <div className="font-cinzel text-[14px] text-gold-deep">→</div>
    </Link>
  );
}
