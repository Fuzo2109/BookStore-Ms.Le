import Link from "next/link";
import { toQueryString, type CatalogParams } from "@/lib/catalog-params";

/** F3 pagination that keeps the current search/filter values (F5). */
export function Pagination({ params, totalPages }: { params: CatalogParams; totalPages: number }) {
  if (totalPages <= 1) return null;
  const current = Math.min(params.page, totalPages);
  const href = (page: number) => {
    const qs = toQueryString({ ...params, page });
    return qs ? `/books?${qs}` : "/books";
  };

  // Show first, last and a window of 2 pages around the current one.
  const pages: (number | "gap")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - current) <= 2) pages.push(p);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }

  const base = "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {current > 1 ? (
        <Link href={href(current - 1)} className={`${base} border-stone-300 bg-white hover:bg-stone-50`} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className={`${base} border-stone-200 text-stone-400`}>← Previous</span>
      )}

      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-stone-400">
            …
          </span>
        ) : p === current ? (
          <span key={p} aria-current="page" className={`${base} border-brand-600 bg-brand-600 font-semibold text-white`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} className={`${base} border-stone-300 bg-white hover:bg-stone-50`}>
            {p}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link href={href(current + 1)} className={`${base} border-stone-300 bg-white hover:bg-stone-50`} rel="next">
          Next →
        </Link>
      ) : (
        <span className={`${base} border-stone-200 text-stone-400`}>Next →</span>
      )}
    </nav>
  );
}
