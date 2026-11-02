import { describe, expect, it } from "vitest";
import { PAGE_SIZE, parseCatalogParams, sanitizeSearch, toQueryString, totalPages } from "@/lib/catalog-params";

describe("F3 pagination", () => {
  it("shows 12 books per page", () => {
    expect(PAGE_SIZE).toBe(12);
    expect(totalPages(36)).toBe(3);
    expect(totalPages(37)).toBe(4);
    expect(totalPages(0)).toBe(1);
  });

  it("defaults to page 1 for missing or invalid page values", () => {
    expect(parseCatalogParams({}).page).toBe(1);
    expect(parseCatalogParams({ page: "0" }).page).toBe(1);
    expect(parseCatalogParams({ page: "-3" }).page).toBe(1);
    expect(parseCatalogParams({ page: "abc" }).page).toBe(1);
    expect(parseCatalogParams({ page: "2" }).page).toBe(2);
  });
});

describe("F5 search and filters", () => {
  it("keeps filters in the query string so pagination preserves them", () => {
    const p = parseCatalogParams({ q: "Orwell", category: "2", minPrice: "50000", maxPrice: "150000", page: "2" });
    expect(toQueryString({ ...p, page: 3 })).toBe("q=Orwell&category=2&minPrice=50000&maxPrice=150000&page=3");
  });

  it("drops page=1 and empty values from links", () => {
    expect(toQueryString(parseCatalogParams({ q: "", category: "", page: "1" }))).toBe("");
  });

  it("ignores invalid category/price values instead of failing", () => {
    const p = parseCatalogParams({ category: "x", minPrice: "-5", maxPrice: "1e9" });
    expect(p.category).toBeUndefined();
    expect(p.minPrice).toBeUndefined();
    expect(p.maxPrice).toBeUndefined();
  });

  it("accepts a price boundary of 0 and swaps a reversed range", () => {
    expect(parseCatalogParams({ minPrice: "0" }).minPrice).toBe(0);
    const p = parseCatalogParams({ minPrice: "200000", maxPrice: "100000" });
    expect([p.minPrice, p.maxPrice]).toEqual([100000, 200000]);
  });

  it("treats search input as plain text (no filter injection)", () => {
    expect(sanitizeSearch("a,title.eq.x)")).toBe("a title.eq.x");
    expect(sanitizeSearch("100%_off")).toBe("100 off");
    expect(sanitizeSearch("  J.R.R. Tolkien ")).toBe("J.R.R. Tolkien");
  });

  it("limits the search text to 100 characters", () => {
    expect(parseCatalogParams({ q: "x".repeat(300) }).q).toHaveLength(100);
  });
});
