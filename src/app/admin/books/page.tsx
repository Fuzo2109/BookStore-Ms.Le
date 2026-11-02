import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { coverUrl, formatDate, formatPrice } from "@/lib/format";
import { restoreBook, softDeleteBook } from "./actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { FormAlert } from "@/components/FormBits";

export const metadata: Metadata = { title: "Manage books" };

const ADMIN_PAGE_SIZE = 20;

type Props = { searchParams: Promise<{ show?: string; page?: string; saved?: string; q?: string }> };

interface AdminBookRow {
  id: number;
  title: string;
  price: number;
  stock: number;
  thumbnail_path: string | null;
  deleted_at: string | null;
  created_at: string;
  authors: { name: string } | null;
  categories: { name: string } | null;
}

export default async function AdminBooksPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showDeleted = sp.show === "deleted";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").replace(/[,()*%_\\:"]/g, " ").trim().slice(0, 100);

  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select("id, title, price, stock, thumbnail_path, deleted_at, created_at, authors(name), categories(name)", {
      count: "exact",
    });
  query = showDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  if (q) query = query.ilike("title", `%${q}%`);
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  const books = (data ?? []) as unknown as AdminBookRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / ADMIN_PAGE_SIZE));
  const link = (p: number) =>
    `/admin/books?${new URLSearchParams({ ...(showDeleted ? { show: "deleted" } : {}), ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{showDeleted ? "Deleted books" : "Books"}</h1>
        <div className="flex gap-2">
          <Link href={showDeleted ? "/admin/books" : "/admin/books?show=deleted"} className="btn-outline">
            {showDeleted ? "Show active books" : "Show deleted books"}
          </Link>
          <Link href="/admin/books/new" className="btn-accent">
            + Add a book
          </Link>
        </div>
      </div>

      {sp.saved && (
        <div className="mb-4">
          <FormAlert success={`Book #${sp.saved} was saved.`} />
        </div>
      )}

      <form method="get" className="mb-4 flex max-w-md gap-2">
        {showDeleted && <input type="hidden" name="show" value="deleted" />}
        <label htmlFor="admin-q" className="sr-only">
          Search by title
        </label>
        <input id="admin-q" name="q" type="search" defaultValue={q} placeholder="Search by title" className="input" />
        <button className="btn-outline">Search</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
            <tr>
              <th className="px-3 py-2">Cover</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Author</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Stock</th>
              <th className="px-3 py-2">Added</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {books.map((b) => (
              <tr key={b.id} className="align-middle">
                <td className="px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl(b.thumbnail_path)} alt="" width={40} height={60} className="h-15 w-10 rounded object-cover" />
                </td>
                <td className="px-3 py-2 font-medium">{b.title}</td>
                <td className="px-3 py-2">{b.authors?.name}</td>
                <td className="px-3 py-2">{b.categories?.name}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{formatPrice(b.price)}</td>
                <td className="px-3 py-2 text-right">{b.stock}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(b.created_at)}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/books/${b.id}/edit`} className="btn-outline px-3 py-1">
                      Edit
                    </Link>
                    {showDeleted ? (
                      <form action={restoreBook.bind(null, b.id)}>
                        <button className="btn-primary px-3 py-1">Restore</button>
                      </form>
                    ) : (
                      <form action={softDeleteBook.bind(null, b.id)}>
                        <ConfirmButton message={`Delete “${b.title}”? It will be hidden from customers.`}>
                          Delete
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-stone-500">
                  No books here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 && <Link href={link(page - 1)} className="btn-outline px-3 py-1">← Previous</Link>}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages && <Link href={link(page + 1)} className="btn-outline px-3 py-1">Next →</Link>}
        </nav>
      )}
    </div>
  );
}
