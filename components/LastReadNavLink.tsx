"use client";

import Link from "next/link";
import { useLastRead } from "@/lib/last-read";

/**
 * Small "open book" icon in the nav that jumps the user back to
 * their last-settled ayah. Renders nothing until both:
 *   - the component has hydrated (so SSR + client agree)
 *   - a last-read entry actually exists in localStorage
 * That keeps the nav uncluttered for first-time visitors.
 */
export function LastReadNavLink() {
  const { lastRead, ready } = useLastRead();
  if (!ready || !lastRead) return null;

  return (
    <Link
      href={`/quran/${lastRead.surah}#ayah-${lastRead.ayah}`}
      aria-label={`Continue reading Sūrah ${lastRead.surah_name_en} verse ${lastRead.ayah}`}
      title={`Continue: Sūrah ${lastRead.surah_name_en} · verse ${lastRead.ayah}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded text-gold transition-colors duration-300 hover:text-gold-bright"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        {/* Open-book glyph */}
        <path
          d="M3 5.5C3 4.7 3.7 4 4.5 4H10c.9 0 1.7.4 2 1 .3-.6 1.1-1 2-1h5.5c.8 0 1.5.7 1.5 1.5V18c0 .8-.7 1.5-1.5 1.5H14c-.7 0-1.4.3-2 .8-.6-.5-1.3-.8-2-.8H4.5C3.7 19.5 3 18.8 3 18V5.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M12 6v13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
