import Link from "next/link";
import { coverUrl, formatPrice } from "@/lib/format";
import type { CatalogListItem } from "@/lib/catalog";

/**
 * F3 card: cover (thumbnail, CR-04), title, author, price.
 * `returnTo` is the current list query string so F4's "Back" returns to the same page.
 */
export function BookCard({ book, returnTo = "" }: { book: CatalogListItem; returnTo?: string }) {
  const href = returnTo ? `/books/${book.id}?from=${encodeURIComponent(returnTo)}` : `/books/${book.id}`;

  return (
    <article className="group flex flex-col">
      <Link href={href} className="block overflow-hidden rounded-md bg-stone-100 shadow-sm ring-1 ring-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails are pre-sized by CR-04 */}
        <img
          src={coverUrl(book.thumbnail_path)}
          alt={`Cover of ${book.title}`}
          width={300}
          height={450}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-2 flex flex-1 flex-col">
        <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug">
          <Link href={href} className="hover:text-brand-600">
            {book.title}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">{book.author_name}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <p className="font-bold text-brand-700">{formatPrice(book.price)}</p>
          {book.stock === 0 && (
            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-xs text-stone-600">Out of stock</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function BookGrid({ books, returnTo }: { books: CatalogListItem[]; returnTo?: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {books.map((b) => (
        <BookCard key={b.id} book={b} returnTo={returnTo} />
      ))}
    </div>
  );
}
