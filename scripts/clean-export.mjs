#!/usr/bin/env node
/**
 * Post-build cleanup for Next.js static export.
 *
 * Next.js 16 emits a set of internal streaming-metadata artifacts
 * alongside the actual HTML files. They're never served to real users
 * but they include `$` in the filename for dynamic routes (e.g.
 * `__next.quran.$d$surah.txt`), which several static hosts —
 * notably Cloudflare Pages — reject during upload.
 *
 * We sweep the export directory and delete:
 *   - any  __next.*.txt  (per-route streaming metadata)
 *   - the top-level /index.txt / /<route>/index.txt mirror files
 *
 * Run automatically as a `postbuild` npm script.
 */
import { readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "out";

function shouldDelete(name) {
  if (name.startsWith("__next.") && name.endsWith(".txt")) return true;
  if (name === "index.txt") return true;
  return false;
}

async function walk(dir) {
  let removed = 0;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return 0;
    throw err;
  }
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      removed += await walk(p);
    } else if (ent.isFile() && shouldDelete(ent.name)) {
      await rm(p, { force: true });
      removed += 1;
    }
  }
  return removed;
}

try {
  await stat(ROOT);
} catch {
  console.log(`[clean-export] ${ROOT}/ not found — skipping.`);
  process.exit(0);
}

const removed = await walk(ROOT);
console.log(
  `[clean-export] Removed ${removed} streaming-metadata artifact${
    removed === 1 ? "" : "s"
  } from ${ROOT}/`,
);
