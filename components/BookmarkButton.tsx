"use client";

import { useBookmarks } from "@/lib/bookmarks";

type Props =
  | { kind: "verse"; surah: number; ayah: number; label?: string }
  | { kind: "hadith"; id: string; label?: string };

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      className="transition-transform duration-200 group-hover:scale-110"
    >
      <polygon
        points="12,2.5 14.85,9.04 22,9.78 16.65,14.55 18.18,21.5 12,17.92 5.82,21.5 7.35,14.55 2,9.78 9.15,9.04"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookmarkButton(props: Props) {
  const { ready, hasVerse, hasHadith, toggleVerse, toggleHadith } =
    useBookmarks();

  const isVerse = props.kind === "verse";
  const active = ready
    ? isVerse
      ? hasVerse(props.surah, props.ayah)
      : hasHadith(props.id)
    : false;

  const onClick = () => {
    if (isVerse) toggleVerse(props.surah, props.ayah);
    else toggleHadith(props.id);
  };

  const label = props.label
    ?? (isVerse
      ? `Bookmark ayah ${props.surah}:${props.ayah}`
      : "Bookmark this hadith");

  // Render an invisible placeholder during SSR so the layout doesn't
  // shift after hydration; the actual icon appears once ready.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={active ? "Remove bookmark" : "Add bookmark"}
      className={`group inline-flex h-8 w-8 items-center justify-center rounded transition-colors duration-200 ${
        ready ? "" : "invisible"
      } ${
        active
          ? "text-gold hover:text-gold-bright"
          : "text-muted hover:text-gold"
      }`}
    >
      <StarIcon filled={active} />
    </button>
  );
}
