import Link from "next/link";
import type { CatalogParams } from "@/lib/catalog-params";
import type { Category } from "@/lib/types";

/**
 * F5: search + category + price range. A GET form, so the filters live in the
 * URL and work together with F3 pagination (submitting resets to page 1).
 */
export function CatalogFilters({ params, categories }: { params: CatalogParams; categories: Category[] }) {
  return (
    <form action="/books" method="get" className="card space-y-5 p-4" aria-label="Filter books">
      <div>
        <label htmlFor="f-q" className="label">
          Title or author
        </label>
        <input id="f-q" name="q" type="search" maxLength={100} defaultValue={params.q} className="input" />
      </div>

      <div>
        <label htmlFor="f-category" className="label">
          Category
        </label>
        <select id="f-category" name="category" defaultValue={params.category ?? ""} className="input">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Price (VND)</legend>
        <div className="flex items-center gap-2">
          <label htmlFor="f-min" className="sr-only">
            Minimum price
          </label>
          <input
            id="f-min"
            name="minPrice"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="Min"
            defaultValue={params.minPrice ?? ""}
            className="input"
          />
          <span className="text-stone-400">–</span>
          <label htmlFor="f-max" className="sr-only">
            Maximum price
          </label>
          <input
            id="f-max"
            name="maxPrice"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="Max"
            defaultValue={params.maxPrice ?? ""}
            className="input"
          />
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          Apply
        </button>
        <Link href="/books" className="btn-outline">
          Clear
        </Link>
      </div>
    </form>
  );
}
