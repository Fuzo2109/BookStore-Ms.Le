import { z } from "zod";

/*
 * Server-side validation rules. The same limits are mirrored as HTML
 * attributes (required, min, maxLength, accept) for client-side validation,
 * but the server never trusts the client.
 */

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.");
const fullName = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(100, "Full name must be at most 100 characters.");

// ---------- F1 ----------
export const registerSchema = z
  .object({ fullName, email, password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const createUserSchema = z.object({
  fullName,
  email,
  password,
  role: z.enum(["admin", "customer"], { message: "Choose a role." }),
});

// ---------- F2 ----------
const positiveId = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `Choose ${label}.` })
    .int(`Choose ${label}.`)
    .positive(`Choose ${label}.`);

export const MAX_PRICE = 100_000_000; // VND
export const MAX_STOCK = 100_000;

/** Trims and collapses inner spaces: "  J.R.R.   Tolkien " → "J.R.R. Tolkien". */
export function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Key used to match names regardless of case/spacing (mirrors the DB unique index). */
export function nameKey(value: string): string {
  return normalizeName(value).toLowerCase();
}

/** Escapes LIKE wildcards so user text is matched literally. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(255, "Title must be at most 255 characters."),
  // Typed with suggestions; an unknown name creates a new author on save.
  authorName: z
    .string()
    .transform(normalizeName)
    .pipe(z.string().min(1, "Author is required.").max(150, "Author name must be at most 150 characters.")),
  categoryId: positiveId("a category"),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number." })
    .int("Price must be a whole number of VND.")
    .gt(0, "Price must be greater than 0.")
    .max(MAX_PRICE, `Price must be at most ${MAX_PRICE.toLocaleString("en-US")} VND.`),
  stock: z.coerce
    .number({ invalid_type_error: "Stock must be a number." })
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(MAX_STOCK, `Stock must be at most ${MAX_STOCK.toLocaleString("en-US")}.`),
  description: z.string().trim().max(5000, "Description must be at most 5000 characters."),
});

// ---------- Product details (optional) ----------
/** Removes spaces and hyphens: "978-0-06-093546-7" → "9780060935467". */
export function normalizeIsbn(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const sum = [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return sum % 10 === 0;
}

export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const sum = [...isbn].reduce((acc, ch, i) => acc + (ch === "X" ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
}

const optionalText = (max: number, label: string) =>
  z
    .string()
    .transform(normalizeName)
    .pipe(z.string().max(max, `${label} must be at most ${max} characters.`))
    .transform((v) => v || null);

export const bookDetailsSchema = z.object({
  format: optionalText(50, "Format"),
  language: optionalText(50, "Language"),
  publisher: optionalText(150, "Publisher"),
  dimensions: optionalText(60, "Dimensions"),
  publicationDate: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), "Enter a valid date.")
    .transform((v) => v || null),
  isbn13: z
    .string()
    .transform(normalizeIsbn)
    .refine((v) => v === "" || isValidIsbn13(v), "ISBN-13 must be 13 digits with a valid check digit.")
    .transform((v) => v || null),
  isbn10: z
    .string()
    .transform(normalizeIsbn)
    .refine((v) => v === "" || isValidIsbn10(v), "ISBN-10 must be 10 characters (last may be X) with a valid check digit.")
    .transform((v) => v || null),
  shippingWeight: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\d{1,4}(\.\d{1,2})?$/.test(v) && Number(v) > 0),
      "Shipping weight must be a positive number in lbs (up to 2 decimals).",
    )
    .transform((v) => (v === "" ? null : Number(v))),
});

export const nameSchema = z.object({
  name: z
    .string()
    .transform(normalizeName)
    .pipe(z.string().min(1, "Name is required.").max(100, "Name must be at most 100 characters.")),
});

/** Turns a ZodError into { field: firstMessage }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Reads plain string fields from FormData (used to refill forms after an error). */
export function formValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) {
    const v = formData.get(key);
    out[key] = typeof v === "string" ? v : "";
  }
  return out;
}

/** Only allow same-site relative redirects such as "/admin" (blocks "//evil.com"). */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
