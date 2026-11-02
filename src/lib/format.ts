export const DEFAULT_COVER = "/images/default-cover.svg";

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function formatPrice(value: number | string): string {
  return vnd.format(Number(value));
}

/** Public URL of a file in the book-covers bucket, or the default cover (CR-04 AC5). */
export function coverUrl(path: string | null | undefined): string {
  if (!path) return DEFAULT_COVER;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/book-covers/${path}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
