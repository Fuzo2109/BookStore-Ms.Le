import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog";
import { coverUrl, formatDate, formatPrice } from "@/lib/format";
import { restoreBook, softDeleteBook } from "./actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { FormAlert } from "@/components/FormBits";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconPlus } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Books" };

const ADMIN_PAGE_SIZE = 20;
const LOW_STOCK = 5;
const FILTERS = { low: `Low stock (≤ ${LOW_STOCK})`, out: "Out of stock", nocover: "Missing cover" } as const;
type Filter = keyof typeof FILTERS;

type Props = {
  searchParams: Promise<{ show?: string; page?: string; saved?: string; q?: string; filter?: string; category?: string }>;
};

interface AdminBookRow {
  id: number;
  title: string;
  price: number;
  stock: number;
  thumbnail_path: string | null;
  cover_path: string | null;
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
  const filter = (sp.filter && sp.filter in FILTERS ? sp.filter : undefined) as Filter | undefined;
  const category = /^\d{1,9}$/.test(sp.category ?? "") ? Number(sp.category) : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select(
      "id, title, price, stock, thumbnail_path, cover_path, deleted_at, created_at, authors(name), categories(name)",
      { count: "exact" },
    );
  query = showDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category_id", category);
  if (filter === "low") query = query.gt("stock", 0).lte("stock", LOW_STOCK);
  if (filter === "out") query = query.eq("stock", 0);
  if (filter === "nocover") query = query.is("cover_path", null);

  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const [{ data, count }, categories] = await Promise.all([
    query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + ADMIN_PAGE_SIZE - 1),
    getCategories(),
  ]);

  const books = (data ?? []) as unknown as AdminBookRow[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const qs = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = {
      show: showDeleted ? "deleted" : undefined,
      q: q || undefined,
      filter,
      category: category ? String(category) : undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/books?${s}` : "/admin/books";
  };

  const tab = (active: boolean) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold ${active ? "border-brand-600 text-brand-700" : "border-transparent text-stone-500 hover:text-stone-800"}`;

  return (
    <div>
      <PageHeader
        title="Books"
        description="Add, edit and hide books. Deleted books are hidden from customers and can be restored."
        crumbs={[{ href: "/admin", label: "Dashboard" }]}
        actions={
          <Link href="/admin/books/new" className="btn-accent">
            <IconPlus /> Add a book
          </Link>
        }
      />

      {sp.saved && (
        <div className="mb-4">
          <FormAlert success={`Book #${sp.saved} was saved.`} />
        </div>
      )}

      <div className="card">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-stone-200 px-5 pt-4">
          <Link href="/admin/books" className={tab(!showDeleted)}>
            On sale
          </Link>
          <Link href="/admin/books?show=deleted" className={tab(showDeleted)}>
            Deleted
          </Link>
        </div>

        {/* Toolbar */}
        <form method="get" className="flex flex-wrap items-end gap-3 border-b border-stone-100 px-5 py-4">
          {showDeleted && <input type="hidden" name="show" value="deleted" />}
          <div className="min-w-48 flex-1">
            <label htmlFor="admin-q" className="label">
              Title
            </label>
            <input id="admin-q" name="q" type="search" defaultValue={q} placeholder="Search by title" className="input" />
          </div>
          <div>
            <label htmlFor="admin-category" className="label">
              Category
            </label>
            <select id="admin-category" name="category" defaultValue={category ?? ""} className="input">
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-filter" className="label">
              Status
            </label>
            <select id="admin-filter" name="filter" defaultValue={filter ?? ""} className="input">
              <option value="">All</option>
              {Object.entries(FILTERS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary">Apply</button>
          {(q || filter || category) && (
            <Link href={showDeleted ? "/admin/books?show=deleted" : "/admin/books"} className="btn-outline">
              Clear
            </Link>
          )}
        </form>

        <p className="px-5 pt-3 text-xs text-stone-500">
          {total} {total === 1 ? "book" : "books"}
          {pages > 1 && ` · page ${Math.min(page, pages)} of ${pages}`}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-stone-500 uppercase">
              <tr className="border-b border-stone-100">
                <th className="px-5 py-2 font-semibold">Book</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 text-right font-semibold">Price</th>
                <th className="px-3 py-2 text-right font-semibold">Stock</th>
                <th className="px-3 py-2 font-semibold">Added</th>
                <th className="px-5 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {books.map((b) => (
                <tr key={b.id} className="align-middle hover:bg-stone-50">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl(b.thumbnail_path)} alt="" width={36} height={54} className="h-13.5 w-9 shrink-0 rounded object-cover ring-1 ring-stone-200" />
                      <div className="min-w-0">
                        <Link href={`/admin/books/${b.id}/edit`} className="block max-w-xs truncate font-medium text-stone-900 hover:text-brand-600">
                          {b.title}
                        </Link>
                        <span className="block text-xs text-stone-500">
                          {b.authors?.name} · #{b.id}
                          {!b.cover_path && <span className="ml-1 text-amber-600">· no cover</span>}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-stone-700">{b.categories?.name}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">{formatPrice(b.price)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {b.stock === 0 ? (
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">0</span>
                    ) : b.stock <= LOW_STOCK ? (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{b.stock}</span>
                    ) : (
                      b.stock
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-stone-600">{formatDate(b.created_at)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-2">
                      <Link href={`/books/${b.id}`} className="btn-outline px-3 py-1" target="_blank">
                        View
                      </Link>
                      <Link href={`/admin/books/${b.id}/edit`} className="btn-outline px-3 py-1">
                        Edit
                      </Link>
                      {showDeleted ? (
                        <form action={restoreBook.bind(null, b.id)}>
                          <button className="btn-primary px-3 py-1">Restore</button>
                        </form>
                      ) : (
                        <form action={softDeleteBook.bind(null, b.id)}>
                          <ConfirmButton message={`Delete “${b.title}”? It will be hidden from customers.`}>Delete</ConfirmButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No books match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <nav className="flex items-center justify-between border-t border-stone-100 px-5 py-3 text-sm" aria-label="Pagination">
            {page > 1 ? (
              <Link href={qs({ page: String(page - 1) })} className="btn-outline px-3 py-1">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-stone-500">
              Page {Math.min(page, pages)} of {pages}
            </span>
            {page < pages ? (
              <Link href={qs({ page: String(page + 1) })} className="btn-outline px-3 py-1">
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
