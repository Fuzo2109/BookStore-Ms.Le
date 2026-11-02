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

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(255, "Title must be at most 255 characters."),
  authorId: positiveId("an author"),
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

export const nameSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100, "Name must be at most 100 characters."),
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
