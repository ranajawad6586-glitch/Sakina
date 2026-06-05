/**
 * Server-rendered play button. Click handling lives in
 * <AudioController/> at the layout level via event delegation, so
 * adding one button per verse costs zero React hydration.
 */
export function VerseAudioButton({
  surah,
  ayah,
}: {
  surah: number;
  ayah: number;
}) {
  return (
    <button
      type="button"
      className="verse-audio"
      data-verse-audio={`${surah}:${ayah}`}
      aria-label={`Play recitation of ayah ${surah}:${ayah}`}
      title="Play"
    >
      <svg
        className="audio-icon-play"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polygon points="7,5 19,12 7,19" fill="currentColor" />
      </svg>
      <svg
        className="audio-icon-pause"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="6" y="5" width="4" height="14" fill="currentColor" />
        <rect x="14" y="5" width="4" height="14" fill="currentColor" />
      </svg>
      <svg
        className="audio-icon-loading"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="14 28"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
