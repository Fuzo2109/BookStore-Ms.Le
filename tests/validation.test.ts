import { describe, expect, it } from "vitest";
import {
  bookDetailsSchema,
  bookSchema,
  escapeLike,
  isValidIsbn10,
  isValidIsbn13,
  nameKey,
  normalizeName,
  registerSchema,
  safeRedirectPath,
} from "@/lib/validation";

const validBook = { title: "Dune", authorName: "Frank Herbert", categoryId: "2", price: "210000", stock: "5", description: "" };

describe("F2 book validation (server side)", () => {
  it("accepts a valid book", () => {
    expect(bookSchema.safeParse(validBook).success).toBe(true);
  });

  it.each([
    ["price 0", { price: "0" }, "price"],
    ["negative price", { price: "-1" }, "price"],
    ["text price", { price: "abc" }, "price"],
    ["negative stock", { stock: "-1" }, "stock"],
    ["decimal stock", { stock: "1.5" }, "stock"],
    ["blank title", { title: "   " }, "title"],
    ["missing author", { authorName: "" }, "authorName"],
    ["blank author", { authorName: "   " }, "authorName"],
    ["missing category", { categoryId: "" }, "categoryId"],
  ])("rejects %s", (_label, patch, field) => {
    const r = bookSchema.safeParse({ ...validBook, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe(field);
  });

  it("accepts the price boundary of 1 VND and stock 0", () => {
    expect(bookSchema.safeParse({ ...validBook, price: "1", stock: "0" }).success).toBe(true);
  });
});

describe("F1 registration validation", () => {
  const ok = { fullName: "Le Tan Nguyen", email: "nguyen@example.com", password: "secret123", confirmPassword: "secret123" };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(ok).success).toBe(true);
  });

  it("rejects a short password and mismatched confirmation", () => {
    expect(registerSchema.safeParse({ ...ok, password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...ok, confirmPassword: "different1" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...ok, email: "not-an-email" }).success).toBe(false);
  });
});

describe("safe redirects after login", () => {
  it("only allows same-site paths", () => {
    expect(safeRedirectPath("/admin")).toBe("/admin");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
  });
});

describe("F2 author typed with suggestions", () => {
  it("normalises spaces in the author name", () => {
    const r = bookSchema.safeParse({ ...validBook, authorName: "  J.R.R.   Tolkien " });
    expect(r.success && r.data.authorName).toBe("J.R.R. Tolkien");
  });

  it("matches existing authors regardless of case and spacing", () => {
    expect(nameKey("j.r.r.  TOLKIEN")).toBe(nameKey("J.R.R. Tolkien"));
    expect(normalizeName(" Nguyen   Nhat Anh ")).toBe("Nguyen Nhat Anh");
  });

  it("treats LIKE wildcards in names literally", () => {
    expect(escapeLike("100%_real")).toBe("100\\%\\_real");
  });
});

describe("Product details (F2/F4)", () => {
  const ok = { format: "Paperback", language: "English", publisher: "HarperCollins Publishers", dimensions: "", publicationDate: "2002-03-05", isbn13: "978-0-06-093546-7", isbn10: "0060935464", shippingWeight: "0.55" };

  it("accepts valid details and normalises the ISBN", () => {
    const r = bookDetailsSchema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isbn13).toBe("9780060935467");
      expect(r.data.dimensions).toBeNull();
      expect(r.data.shippingWeight).toBe(0.55);
    }
  });

  it("treats every field as optional", () => {
    const empty = Object.fromEntries(Object.keys(ok).map((k) => [k, ""]));
    expect(bookDetailsSchema.safeParse(empty).success).toBe(true);
  });

  it.each([
    ["ISBN-13 with a wrong check digit", { isbn13: "9780060935468" }, "isbn13"],
    ["ISBN-13 with 12 digits", { isbn13: "978006093546" }, "isbn13"],
    ["ISBN-10 with letters", { isbn10: "06A0935464" }, "isbn10"],
    ["zero shipping weight", { shippingWeight: "0" }, "shippingWeight"],
    ["invalid date", { publicationDate: "2010-13-40" }, "publicationDate"],
  ])("rejects %s", (_l, patch, field) => {
    const r = bookDetailsSchema.safeParse({ ...ok, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe(field);
  });

  it("validates ISBN check digits", () => {
    expect(isValidIsbn13("9780545174800")).toBe(true);
    expect(isValidIsbn10("0545174805")).toBe(true);
    expect(isValidIsbn10("080442957X")).toBe(true);
  });
});
