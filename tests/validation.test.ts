import { describe, expect, it } from "vitest";
import { bookSchema, registerSchema, safeRedirectPath } from "@/lib/validation";

const validBook = { title: "Dune", authorId: "1", categoryId: "2", price: "210000", stock: "5", description: "" };

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
    ["missing author", { authorId: "" }, "authorId"],
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
