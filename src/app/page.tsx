import Link from "next/link";
import { listBooks, getCategories } from "@/lib/catalog";
import { BookGrid } from "@/components/BookCard";
import { SearchBox } from "@/components/SearchBox";

export default async function HomePage() {
  const [{ books: newest, total }, categories] = await Promise.all([
    listBooks({ page: 1, q: "" }),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold tracking-wider text-accent-400 uppercase">Ms. Le Bookstore</p>
            <h1 className="mt-2 text-3xl leading-tight font-bold text-white md:text-5xl">
              Find your next favourite book
            </h1>
            <p className="mt-4 max-w-lg text-brand-50">
              Browse {total > 0 ? `${total} titles` : "our titles"} from classics to children&apos;s books. Search by
              title or author, or filter by category and price.
            </p>
            <div className="mt-6 max-w-lg">
              <SearchBox />
            </div>
          </div>
          <div className="hidden justify-center md:flex" aria-hidden="true">
            <div className="relative h-64 w-80">
              <div className="absolute left-4 top-6 h-56 w-40 -rotate-6 rounded-md bg-accent-500 shadow-xl" />
              <div className="absolute left-24 top-2 h-60 w-40 rotate-3 rounded-md bg-cream shadow-xl" />
              <div className="absolute left-44 top-8 h-52 w-36 rotate-12 rounded-md bg-brand-900 shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-b border-stone-200 bg-white">
        <ul className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-sm sm:grid-cols-3">
          {[
            ["📚", "A growing catalogue", "New titles are added by our staff every week."],
            ["🔎", "Easy to find", "Search by title or author, filter by category and price."],
            ["📱", "Any device", "Works on desktop, tablet and phone."],
          ].map(([icon, title, text]) => (
            <li key={title} className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <span>
                <strong className="block text-stone-900">{title}</strong>
                <span className="text-stone-600">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold">New arrivals</h2>
          <Link href="/books" className="text-sm font-semibold text-brand-600 hover:underline">
            See all books →
          </Link>
        </div>
        {newest.length > 0 ? (
          <BookGrid books={newest} />
        ) : (
          <p className="text-stone-600">No books yet. An administrator can add books from the admin page.</p>
        )}
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-14">
        <h2 className="mb-5 text-2xl font-bold">Shop by category</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/books?category=${c.id}`}
                className="card flex h-20 items-center justify-center px-3 text-center font-semibold text-brand-700 transition hover:border-brand-500 hover:bg-brand-50"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
