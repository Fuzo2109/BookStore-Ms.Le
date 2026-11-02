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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={back} className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to the book list
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(240px,360px)_1fr]">
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

          <div className="card mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
            <p className="text-3xl font-bold text-brand-700">{formatPrice(book.price)}</p>
            <p className={book.stock > 0 ? "font-semibold text-brand-600" : "font-semibold text-stone-500"}>
              {book.stock > 0 ? `In stock (${book.stock})` : "Out of stock"}
            </p>
          </div>

          <h2 className="mt-8 text-xl font-bold">Description</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-stone-700">
            {book.description || "No description yet."}
          </p>

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="font-semibold text-stone-500">Author</dt>
            <dd>{book.author_name}</dd>
            <dt className="font-semibold text-stone-500">Category</dt>
            <dd>{book.category_name}</dd>
            <dt className="font-semibold text-stone-500">Book ID</dt>
            <dd>{book.id}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
