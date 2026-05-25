/**
 * fetch-hadith.ts
 *
 * Pulls hadith data from fawazahmed0/hadith-api (which carries the
 * canonical Arabic + English translations *and* the Al-Albānī gradings
 * for the four sunan), curates per CLAUDE.md §6.2, and writes one file
 * per collection under data/hadiths/.
 *
 * Bukhari & Muslim: every hadith is Sahih by collection definition.
 * Nawawi 40:        an-Nawawi only selected sahih/hasan narrations;
 *                   we ship all 42 (canonical 40 + the two added by
 *                   Ibn Rajab) and label them sahih.
 * Four sunan:       we keep only those graded Sahih or Hasan by
 *                   Al-Albānī. Anything else is dropped.
 *
 * Run with:  npx tsx scripts/fetch-hadith.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Hadith, HadithCollectionId, HadithGrade } from "../lib/types";

interface FawazahmedHadith {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
  grades: { name: string; grade: string }[];
  reference: { book: number; hadith: number };
}

interface FawazahmedDoc {
  metadata: {
    name: string;
    sections?: Record<string, string>;
  };
  hadiths: FawazahmedHadith[];
}

interface CollectionSpec {
  id: HadithCollectionId;
  remoteSlug: string;
  collection_ar: string;
  collection_en: string;
  target: number;
  /** If true, ship every hadith (after narrator extraction) as Sahih
   *  without consulting external grade fields. Justified for the
   *  ṣaḥīḥayn and an-Nawawī's curated forty. */
  trustCollection: boolean;
}

const COLLECTIONS: CollectionSpec[] = [
  {
    id: "bukhari",
    remoteSlug: "bukhari",
    collection_ar: "ٱلْبُخَارِيّ",
    collection_en: "Ṣaḥīḥ al-Bukhārī",
    target: 15,
    trustCollection: true,
  },
  {
    id: "muslim",
    remoteSlug: "muslim",
    collection_ar: "مُسْلِم",
    collection_en: "Ṣaḥīḥ Muslim",
    target: 15,
    trustCollection: true,
  },
  {
    id: "nawawi40",
    remoteSlug: "nawawi",
    collection_ar: "ٱلْأَرْبَعُونَ ٱلنَّوَوِيَّة",
    collection_en: "Al-Arbaʿūn an-Nawawīyah",
    target: 42,
    trustCollection: true,
  },
  {
    id: "tirmidhi",
    remoteSlug: "tirmidhi",
    collection_ar: "ٱلتِّرْمِذِيّ",
    collection_en: "Sunan at-Tirmidhī",
    target: 10,
    trustCollection: false,
  },
  {
    id: "abudawud",
    remoteSlug: "abudawud",
    collection_ar: "أَبُو دَاوُد",
    collection_en: "Sunan Abī Dāwūd",
    target: 8,
    trustCollection: false,
  },
  {
    id: "nasai",
    remoteSlug: "nasai",
    collection_ar: "ٱلنَّسَائِيّ",
    collection_en: "Sunan an-Nasāʾī",
    target: 5,
    trustCollection: false,
  },
  {
    id: "ibnmajah",
    remoteSlug: "ibnmajah",
    collection_ar: "ٱبْنُ مَاجَه",
    collection_en: "Sunan Ibn Mājah",
    target: 5,
    trustCollection: false,
  },
];

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

async function fetchEdition(lang: "ara" | "eng", slug: string): Promise<FawazahmedDoc> {
  const url = `${CDN}/${lang}-${slug}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return (await res.json()) as FawazahmedDoc;
}

/**
 * Normalise an Al-Albānī grade string to one of "sahih" | "hasan" | null.
 * Returns null for ḍaʿīf, mawḍūʿ, or unrecognised grades — we drop those.
 */
function normaliseAlbaniGrade(raw: string): HadithGrade | null {
  const g = raw.toLowerCase();
  // Reject explicit weakness markers first.
  if (g.includes("daif") || g.includes("da'if") || g.includes("weak")) return null;
  if (g.includes("mawdu") || g.includes("fabricated")) return null;
  if (g.includes("munkar") || g.includes("matruk")) return null;
  // "Sahih" wins over "Hasan" if both present (e.g. "Hasan Sahih").
  if (g.includes("sahih")) return "sahih";
  if (g.includes("hasan")) return "hasan";
  return null;
}

function pickAlbaniGrade(grades: FawazahmedHadith["grades"]): HadithGrade | null {
  const albani = grades.find((g) => /al[\s-]?albani/i.test(g.name));
  if (!albani) return null;
  return normaliseAlbaniGrade(albani.grade);
}

/**
 * Try to extract a narrator from the start of an English hadith text.
 * Returns { narrator, body } where body has the narrator clause peeled
 * off so the reader displays just the saying.
 *
 * If no pattern matches, returns null — the hadith is then skipped, so
 * we never ship a record without a verified narrator (CLAUDE.md §6.2).
 */
function finalizeExtraction(
  rawName: string,
  rawBody: string,
): { narrator: string; body: string } | null {
  const narrator = rawName
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;.\-—–]+|[\s,:;.\-—–]+$/g, "")
    .trim();
  const body = rawBody.trim();
  if (narrator.length < 2 || narrator.length > 80) return null;
  if (body.length < 20) return null;
  return { narrator, body };
}

function extractNarrator(text: string): { narrator: string; body: string } | null {
  const cleaned = text.replace(/\s+/g, " ").trim();

  // "Narrated X:" / "Narrated by X:" / "Narrated X said:"
  let m = cleaned.match(/^Narrated(?:\s+by)?\s+([^:]+?)\s*:\s*/i);
  if (m) {
    const out = finalizeExtraction(m[1], cleaned.slice(m[0].length));
    if (out) return out;
  }

  // "(Also )?(It is narrated )?On the authority of X (qual) [— other clauses —] [who/that] said: BODY"
  //
  // Implemented in two stages: peel off the prefix, capture the name
  // up to the first paren / em-dash / colon / trigger word, then scan
  // forward in the remainder for the first ": " that introduces the
  // saying. This handles every Nawawi-style preamble — multiple
  // qualifiers in parens, em-dash-separated alternate names, "from
  // the Prophet … from his Lord …" chains, and so on.
  const authMatch = cleaned.match(
    /^(?:Also\s+)?(?:It\s+is\s+narrated\s+)?[Oo]n\s+the\s+authority\s+of\s+/,
  );
  if (authMatch) {
    const afterPrefix = cleaned.slice(authMatch[0].length);
    const nameMatch = afterPrefix.match(
      /^([^(:—–\n]+?)(?=\s*[(—–]|\s*:|\s+(?:who|that|from|narrated|reported)\s)/i,
    );
    if (nameMatch) {
      const rest = afterPrefix.slice(nameMatch[0].length);
      // First colon that introduces actual prose (followed by whitespace + a token).
      const bodyOffset = rest.search(/:\s+\S/);
      if (bodyOffset !== -1) {
        const body = rest.slice(bodyOffset + 1).trim();
        const out = finalizeExtraction(nameMatch[1], body);
        if (out) return out;
      }
    }
  }

  // "X narrated that:" / "X narrated:" / "X reported:"
  m = cleaned.match(/^([A-Z][^:.\n]{2,80}?)\s+(?:narrated(?:\s+that)?|reported)\s*:\s*/);
  if (m) {
    const out = finalizeExtraction(m[1], cleaned.slice(m[0].length));
    if (out) return out;
  }

  // "X said:" — last resort, only fires if the leading phrase looks like a name.
  m = cleaned.match(/^([A-Z][a-zA-Z'`‘’À-ſ .\-]{2,50})\s+said\s*:\s*/);
  if (m) {
    const out = finalizeExtraction(m[1], cleaned.slice(m[0].length));
    if (out) return out;
  }

  return null;
}

interface PairedHadith {
  number: number;
  arText: string;
  enText: string;
  grades: FawazahmedHadith["grades"];
  book?: string;
}

function pairByNumber(ara: FawazahmedDoc, eng: FawazahmedDoc): PairedHadith[] {
  const arByNum = new Map<number, FawazahmedHadith>();
  for (const h of ara.hadiths) arByNum.set(h.hadithnumber, h);

  const paired: PairedHadith[] = [];
  for (const e of eng.hadiths) {
    const a = arByNum.get(e.hadithnumber);
    if (!a) continue;
    paired.push({
      number: e.hadithnumber,
      arText: a.text,
      enText: e.text,
      grades: e.grades.length ? e.grades : a.grades,
      book: eng.metadata.sections?.[String(e.reference.book)],
    });
  }
  return paired;
}

async function curateCollection(spec: CollectionSpec): Promise<Hadith[]> {
  console.log(`  · ${spec.id}: fetching ...`);
  const [ara, eng] = await Promise.all([
    fetchEdition("ara", spec.remoteSlug),
    fetchEdition("eng", spec.remoteSlug),
  ]);
  const paired = pairByNumber(ara, eng);

  const out: Hadith[] = [];
  for (const p of paired) {
    if (out.length >= spec.target) break;

    // Grade gate
    let grade: HadithGrade;
    if (spec.trustCollection) {
      grade = "sahih";
    } else {
      const g = pickAlbaniGrade(p.grades);
      if (!g) continue;
      grade = g;
    }

    // Narrator gate
    const extracted = extractNarrator(p.enText);
    if (!extracted) continue;

    // Sanity: Arabic and English non-empty
    if (!p.arText?.trim() || !extracted.body) continue;

    out.push({
      id: `${spec.id}-${p.number}`,
      collection: spec.id,
      collection_ar: spec.collection_ar,
      collection_en: spec.collection_en,
      number: String(p.number),
      ...(p.book ? { book: p.book } : {}),
      ar: p.arText.trim(),
      en: extracted.body,
      narrator_en: extracted.narrator,
      grade,
    });
  }

  console.log(`    → kept ${out.length} / target ${spec.target}`);
  return out;
}

async function main(): Promise<void> {
  console.log("Fetching hadith collections from fawazahmed0/hadith-api ...");
  const outDir = join(process.cwd(), "data", "hadiths");
  await mkdir(outDir, { recursive: true });

  let total = 0;
  const errors: string[] = [];

  for (const spec of COLLECTIONS) {
    const items = await curateCollection(spec);

    if (items.length < spec.target) {
      errors.push(
        `${spec.id}: only kept ${items.length} of ${spec.target} target`,
      );
    }

    // Per-item integrity (CLAUDE.md §6.2 acceptance checks)
    for (const h of items) {
      if (!h.ar || !h.en || !h.narrator_en || !h.collection || !h.number) {
        errors.push(`${h.id}: missing required field`);
      }
      if (h.grade !== "sahih" && h.grade !== "hasan") {
        errors.push(`${h.id}: invalid grade "${h.grade}"`);
      }
      // §7 cross-check: no transliterations of the Prophet's name like "Mohammed"
      if (/\bMohammed\b/i.test(h.en)) {
        errors.push(`${h.id}: uses "Mohammed" instead of "Muḥammad"`);
      }
    }

    const path = join(outDir, `${spec.id}.json`);
    await writeFile(path, `${JSON.stringify(items, null, 2)}\n`, "utf-8");
    total += items.length;
  }

  console.log(`\nTotal curated: ${total} hadiths`);
  if (total < 50 || total > 100) {
    errors.push(`Total ${total} outside the 50–100 acceptance band`);
  }

  if (errors.length > 0) {
    console.error("\nACCEPTANCE ISSUES:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("OK — all integrity checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
