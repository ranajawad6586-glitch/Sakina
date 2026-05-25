/**
 * Server-rendered star button. The visible state and click handling
 * are managed entirely by <BookmarksClient/> at the page level via
 * event delegation — no per-instance hydration cost, which matters
 * a lot on Al-Baqarah (286 buttons) and the hadith index (100).
 */
type Props =
  | { kind: "verse"; surah: number; ayah: number; label?: string }
  | { kind: "hadith"; id: string; label?: string };

export function BookmarkStar(props: Props) {
  const isVerse = props.kind === "verse";
  const key = isVerse ? `${props.surah}:${props.ayah}` : props.id;
  const dataAttr = isVerse
    ? { "data-bookmark-verse": key }
    : { "data-bookmark-hadith": key };
  const label =
    props.label ??
    (isVerse
      ? `Bookmark ayah ${props.surah}:${props.ayah}`
      : "Bookmark this hadith");

  return (
    <button
      type="button"
      className="bookmark-star"
      aria-pressed="false"
      aria-label={label}
      title="Add bookmark"
      {...dataAttr}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polygon
          className="star-fill"
          points="12,2.5 14.85,9.04 22,9.78 16.65,14.55 18.18,21.5 12,17.92 5.82,21.5 7.35,14.55 2,9.78 9.15,9.04"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
