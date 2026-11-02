import "server-only";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { sniffImageType, validateCoverFile, COVER_FORMAT_MESSAGE } from "@/lib/cover-rules";

export const COVER_BUCKET = "book-covers";
export const THUMBNAIL_WIDTH = 300; // px – enough for a 2x retina card on the list page

export type CoverUploadResult =
  | { ok: true; coverPath: string; thumbnailPath: string }
  | { ok: false; error: string };

/**
 * CR-04: validate the uploaded file, store the original image and a generated
 * WebP thumbnail in Supabase Storage. Caller must already be an admin.
 */
export async function uploadCover(bookId: number, file: File): Promise<CoverUploadResult> {
  const ruleError = validateCoverFile(file);
  if (ruleError) return { ok: false, error: ruleError };

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = sniffImageType(buffer);
  if (!kind) return { ok: false, error: COVER_FORMAT_MESSAGE };

  let thumbnail: Buffer;
  try {
    thumbnail = await sharp(buffer)
      .rotate() // respect EXIF orientation from phone photos
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
  } catch {
    return { ok: false, error: "The image could not be read. Please upload a valid JPG or PNG file." };
  }

  // A timestamp in the name avoids browsers/CDN showing an old cached cover.
  const stamp = Date.now();
  const ext = kind === "jpeg" ? "jpg" : "png";
  const coverPath = `books/${bookId}/original-${stamp}.${ext}`;
  const thumbnailPath = `books/${bookId}/thumb-${stamp}.webp`;

  const storage = createAdminClient().storage.from(COVER_BUCKET);
  const original = await storage.upload(coverPath, buffer, {
    contentType: kind === "jpeg" ? "image/jpeg" : "image/png",
    cacheControl: "31536000",
  });
  if (original.error) return { ok: false, error: `Upload failed: ${original.error.message}` };

  const thumb = await storage.upload(thumbnailPath, thumbnail, {
    contentType: "image/webp",
    cacheControl: "31536000",
  });
  if (thumb.error) {
    await storage.remove([coverPath]);
    return { ok: false, error: `Thumbnail upload failed: ${thumb.error.message}` };
  }

  return { ok: true, coverPath, thumbnailPath };
}

/** Best-effort removal of replaced cover files. */
export async function removeCoverFiles(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length === 0) return;
  await createAdminClient().storage.from(COVER_BUCKET).remove(list);
}
