/*
 * CR-04 cover-image rules. Pure functions (no Node/browser APIs) so they run
 * in the browser for instant feedback AND on the server, and can be unit-tested.
 */

export const MAX_COVER_BYTES = 2 * 1024 * 1024; // 2 MB
export const ACCEPTED_COVER_EXTENSIONS = ["jpg", "jpeg", "png"] as const;
export const ACCEPTED_COVER_MIME = ["image/jpeg", "image/png"] as const;
export const COVER_ACCEPT_ATTR = ".jpg,.jpeg,.png,image/jpeg,image/png";

export const COVER_FORMAT_MESSAGE = "Only JPG and PNG images are accepted.";
export const COVER_SIZE_MESSAGE = "The image is larger than the 2 MB limit.";

export interface CoverFileInfo {
  name: string;
  size: number;
  type: string;
}

/** Returns an error message, or null when the file is acceptable. */
export function validateCoverFile(file: CoverFileInfo): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extOk = (ACCEPTED_COVER_EXTENSIONS as readonly string[]).includes(ext);
  const typeOk = (ACCEPTED_COVER_MIME as readonly string[]).includes(file.type);
  if (!extOk || !typeOk) return COVER_FORMAT_MESSAGE;
  if (file.size > MAX_COVER_BYTES) return COVER_SIZE_MESSAGE;
  if (file.size === 0) return "The image file is empty.";
  return null;
}

/**
 * Checks the file's real content ("magic bytes") so a renamed .gif/.pdf
 * cannot pass as .jpg. Returns the detected type or null.
 */
export function sniffImageType(bytes: Uint8Array): "jpeg" | "png" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= png.length && png.every((b, i) => bytes[i] === b)) return "png";
  return null;
}
