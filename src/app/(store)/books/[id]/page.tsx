import type { Metadata } from "next";
import Link from "next/link";
import { getBook } from "@/lib/catalog";
import { parseCatalogParams, toQueryString } from "@/lib/catalog-params";
import { coverUrl, formatPrice } from "@/lib/format";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).id);
  return { title: book ? book.title : "Book not found" };
}

/** Rebuilds a safe "/books?..." link from the list page the user came from. */
function backHref(from: string | string[] | undefined): string {
  const raw = Array.isArray(from) ? from[0] : from;
  if (!raw) return "/books";
  const qs = toQueryString(parseCatalogParams(Object.fromEntries(new URLSearchParams(raw))));
  return qs ? `/books?${qs}` : "/books";
}

/** F4 – book details. Unknown id → friendly message; Back returns to the same list page. */
export default async function BookDetailPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const book = await getBook(id);
  const back = backHref(sp.from);

  if (!book) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-5xl" aria-hidden="true">
          📕
        </p>
        <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t find that book</h1>
        <p className="mt-2 text-stone-600">
          The book you are looking for does not exist or is no longer available.
        </p>
        <Link href={back} className="btn-primary mt-6">
          ← Back to the book list
        </Link>
      </div>
    );
  }

  const details: [string, string | null][] = [
    ["Format", book.format],
    ["Language", book.language],
    ["Publisher", book.publisher],
    ["Publication date", book.publication_date ? formatLongDate(book.publication_date) : null],
    ["ISBN-13", book.isbn13],
    ["ISBN-10", book.isbn10],
    ["Dimensions", book.dimensions],
    ["Shipping weight", book.shipping_weight_lbs != null ? `${Number(book.shipping_weight_lbs)} lbs` : null],
  ];
  const shownDetails = details.filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={back} className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to the book list
      </Link>

      {/* Top: cover + buying box */}
      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(240px,340px)_1fr]">
        {/* CR-04: the detail page shows the ORIGINAL image (or the default cover). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl(book.cover_path)}
          alt={`Cover of ${book.title}`}
          className="w-full rounded-lg bg-stone-100 shadow-md ring-1 ring-stone-200"
        />

        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            <Link href={`/books?category=${book.category_id}`} className="hover:underline">
              {book.category_name}
            </Link>
          </p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-stone-600">
            by{" "}
            <Link href={`/books?q=${encodeURIComponent(book.author_name)}`} className="text-brand-700 hover:underline">
              {book.author_name}
            </Link>
          </p>

          <div className="card mt-6 max-w-md p-5">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="text-3xl font-bold text-brand-700">{formatPrice(book.price)}</p>
              <p className={book.stock > 0 ? "font-semibold text-brand-600" : "font-semibold text-stone-500"}>
                {book.stock > 0 ? `In stock (${book.stock})` : "Out of stock"}
              </p>
            </div>
            {/* Cart and payment are out of scope for Release 1.0 (brief §2.2): the button is shown but disabled. */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-describedby="cart-note"
              className="btn-accent mt-4 w-full py-3 text-base"
            >
              Add to cart
            </button>
            <p id="cart-note" className="mt-2 text-center text-xs text-stone-500">
              Online ordering is not available yet – visit one of our stores to buy this book.
            </p>
          </div>

          {(book.format || book.publisher || book.isbn13) && (
            <ul className="mt-5 flex flex-wrap gap-2 text-xs">
              {[book.format, book.language, book.isbn13 && `ISBN ${book.isbn13}`].filter(Boolean).map((t) => (
                <li key={t as string} className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Below: description + product details */}
      <div className="mt-12 grid gap-10 border-t border-stone-200 pt-10 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="text-2xl font-bold">
            Description
          </h2>
          <p className="mt-3 leading-relaxed whitespace-pre-line text-stone-700">
            {book.description || "No description yet."}
          </p>
        </section>

        <section aria-labelledby="details-heading" className="card h-fit p-5">
          <h2 id="details-heading" className="font-sans text-lg font-semibold">
            Product details
          </h2>
          <dl className="mt-3 divide-y divide-stone-100 text-sm">
            {[["Author", book.author_name] as [string, string], ["Category", book.category_name] as [string, string], ...shownDetails].map(
              ([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-3 py-2">
                  <dt className="font-medium text-stone-500">{label}</dt>
                  <dd className="break-words text-stone-800">{value}</dd>
                </div>
              ),
            )}
            <div className="grid grid-cols-[130px_1fr] gap-3 py-2">
              <dt className="font-medium text-stone-500">Book ID</dt>
              <dd className="text-stone-800">{book.id}</dd>
            </div>
          </dl>
          {shownDetails.length === 0 && (
            <p className="mt-2 text-xs text-stone-500">More details (publisher, ISBN…) will be added soon.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/** "2010-07-01" → "1 July 2010" (date only, no time-zone shift). */
function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
