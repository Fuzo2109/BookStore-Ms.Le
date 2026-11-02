import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, listBooks } from "@/lib/catalog";
import { parseCatalogParams, toQueryString, totalPages } from "@/lib/catalog-params";
import { BookGrid } from "@/components/BookCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "All books" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** F3 – book list (12 per page, newest first) + F5 – search and filters. */
export default async function BooksPage({ searchParams }: Props) {
  const params = parseCatalogParams(await searchParams);
  const [{ books, total }, categories] = await Promise.all([listBooks(params), getCategories()]);
  const pages = totalPages(total);
  const returnTo = toQueryString(params);
  const category = categories.find((c) => c.id === params.category);
  const filtered = Boolean(params.q || params.category || params.minPrice !== undefined || params.maxPrice !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category ? category.name : params.q ? "Search results" : "All books"}</h1>
        <p className="mt-1 text-sm text-stone-600" aria-live="polite">
          {total} {total === 1 ? "book" : "books"}
          {params.q && (
            <>
              {" "}
              matching “<strong>{params.q}</strong>”
            </>
          )}
          {params.minPrice !== undefined && <> · from {formatPrice(params.minPrice)}</>}
          {params.maxPrice !== undefined && <> · up to {formatPrice(params.maxPrice)}</>}
          {total > 0 && pages > 1 && (
            <>
              {" "}
              · page {Math.min(params.page, pages)} of {pages}
            </>
          )}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <CatalogFilters params={params} categories={categories} />
        </aside>

        <section aria-label="Books">
          {books.length > 0 ? (
            <BookGrid books={books} returnTo={returnTo} />
          ) : total > 0 ? (
            <div className="card p-8 text-center">
              <p className="font-semibold">This page does not exist.</p>
              <Link href={`/books?${toQueryString({ ...params, page: 1 })}`} className="btn-primary mt-4">
                Go to the first page
              </Link>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="font-semibold">{filtered ? "No books match your search." : "No books available yet."}</p>
              {filtered && (
                <>
                  <p className="mt-1 text-sm text-stone-600">Try a different keyword or widen the filters.</p>
                  <Link href="/books" className="btn-outline mt-4">
                    Show all books
                  </Link>
                </>
              )}
            </div>
          )}
          <Pagination params={params} totalPages={pages} />
        </section>
      </div>
    </div>
  );
}
