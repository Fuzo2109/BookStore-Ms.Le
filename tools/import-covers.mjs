#!/usr/bin/env node
/**
 * CR-04 bulk cover import for the sample books (supports task CR04-06: "30 books with covers").
 *
 * For every visible book WITHOUT a cover it:
 *   1. finds the book on Open Library (title + author search),
 *   2. downloads the large cover (JPG),
 *   3. applies the same CR-04 rules as the admin upload (JPG/PNG only, ≤ 2 MB, real image bytes),
 *   4. creates the same 300-px WebP thumbnail as src/lib/covers.ts,
 *   5. uploads original + thumbnail to the `book-covers` bucket and updates the book.
 *
 * Run from the repository root (Node 20.6+):
 *   node --env-file=.env.local tools/import-covers.mjs            # do it
 *   node --env-file=.env.local tools/import-covers.mjs --dry-run  # only show what would happen
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (never commit that file).
 * Cover images come from Open Library (https://openlibrary.org/dev/docs/api/covers); covers are
 * used for this class demo only.
 */
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const MAX_BYTES = 2 * 1024 * 1024;
const THUMB_WIDTH = 300;
const BUCKET = "book-covers";
const dryRun = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  return null;
}

async function findCoverId(title, author) {
  const q = new URLSearchParams({ title, author, limit: "5", fields: "cover_i,title" });
  const res = await fetch(`https://openlibrary.org/search.json?${q}`, {
    headers: { "User-Agent": "Group4-Bookstore-ClassProject/1.0" },
  });
  if (!res.ok) throw new Error(`search HTTP ${res.status}`);
  const json = await res.json();
  return json.docs?.find((d) => d.cover_i)?.cover_i ?? null;
}

async function main() {
  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, cover_path, authors(name)")
    .is("deleted_at", null)
    .is("cover_path", null)
    .order("id");
  if (error) throw error;
  console.log(`${books.length} books without a cover${dryRun ? " (dry run)" : ""}\n`);

  const report = { ok: [], skipped: [] };
  for (const b of books) {
    const author = b.authors?.name ?? "";
    try {
      const coverId = await findCoverId(b.title, author);
      if (!coverId) throw new Error("no cover on Open Library");

      const img = await fetch(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`);
      if (!img.ok) throw new Error(`cover HTTP ${img.status}`);
      let buf = Buffer.from(await img.arrayBuffer());
      const kind = sniff(buf);
      if (!kind) throw new Error("not a JPG/PNG");
      if (buf.length > MAX_BYTES) {
        // Same 2 MB rule as the admin form: shrink rather than store an oversize original.
        buf = await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      }

      const thumb = await sharp(buf).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
      const stamp = Date.now();
      const ext = kind === "png" ? "png" : "jpg";
      const coverPath = `books/${b.id}/original-${stamp}.${ext}`;
      const thumbPath = `books/${b.id}/thumb-${stamp}.webp`;

      if (!dryRun) {
        const s = supabase.storage.from(BUCKET);
        const u1 = await s.upload(coverPath, buf, { contentType: kind === "png" ? "image/png" : "image/jpeg", cacheControl: "31536000" });
        if (u1.error) throw u1.error;
        const u2 = await s.upload(thumbPath, thumb, { contentType: "image/webp", cacheControl: "31536000" });
        if (u2.error) throw u2.error;
        const up = await supabase.from("books").update({ cover_path: coverPath, thumbnail_path: thumbPath }).eq("id", b.id);
        if (up.error) throw up.error;
      }
      report.ok.push(b.title);
      console.log(`✔ #${b.id} ${b.title}  (original ${(buf.length / 1024).toFixed(0)} KB, thumb ${(thumb.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      report.skipped.push(`${b.title}: ${e.message ?? e}`);
      console.log(`✘ #${b.id} ${b.title}  – ${e.message ?? e}`);
    }
    await new Promise((r) => setTimeout(r, 400)); // be polite to Open Library
  }

  console.log(`\nDone: ${report.ok.length} covers ${dryRun ? "found" : "uploaded"}, ${report.skipped.length} skipped.`);
  if (report.skipped.length) console.log("Upload the skipped ones by hand in Admin → Books → Edit → Replace cover.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
