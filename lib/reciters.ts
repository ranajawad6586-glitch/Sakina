/**
 * Reciter catalogue + audio URL builder.
 *
 * Audio is sourced from everyayah.com, which hosts per-ayah MP3s under
 * the pattern  /data/<reciter_slug>/<NNNAAA>.mp3  (3-digit surah and
 * 3-digit ayah, zero-padded). No API key, no rate limits, free to
 * hotlink for non-commercial use.
 */

export interface Reciter {
  /** localStorage key + everyayah.com path segment. */
  id: string;
  /** Display name in the picker. */
  name: string;
  /** Short style note (e.g. "Murattal" / "Mujawwad"). */
  style?: string;
}

export const RECITERS: Reciter[] = [
  {
    id: "Alafasy_64kbps",
    name: "Mishary Rashid Alafasy",
    style: "Murattal",
  },
  {
    id: "Abdul_Basit_Murattal_64kbps",
    name: "Abdul Basit ʿAbd uṣ-Ṣamad",
    style: "Murattal",
  },
  {
    id: "Abdurrahmaan_As-Sudais_64kbps",
    name: "ʿAbdur Raḥmān as-Sudais",
    style: "Murattal",
  },
  {
    id: "Husary_64kbps",
    name: "Maḥmoud Khalīl al-Ḥuṣarī",
    style: "Murattal",
  },
  {
    id: "Saood_ash-Shuraym_64kbps",
    name: "Saʿūd ash-Shuraim",
    style: "Murattal",
  },
];

export const DEFAULT_RECITER_ID = "Alafasy_64kbps";

export function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function audioUrl(
  reciterId: string,
  surah: number,
  ayah: number,
): string {
  return `https://everyayah.com/data/${reciterId}/${pad3(surah)}${pad3(ayah)}.mp3`;
}
