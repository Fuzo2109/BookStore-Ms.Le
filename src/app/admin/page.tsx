import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { coverUrl, formatDate, formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/PageHeader";
import { IconAlert, IconBook, IconImage, IconPlus, IconTrash, IconUsers } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Dashboard" };

const LOW_STOCK = 5;

interface RecentBook {
  id: number;
  title: string;
  price: number;
  stock: number;
  thumbnail_path: string | null;
  created_at: string;
  authors: { name: string } | null;
}

interface AccountRow {
  email: string;
  full_name: string;
  role: "admin" | "customer";
  is_locked: boolean;
  created_at: string;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;
  const active = () => supabase.from("books").select("id", head).is("deleted_at", null);

  const [onSale, outOfStock, lowStock, noCover, deleted, categories, authors, recent, attention, accounts, catalogue] =
    await Promise.all([
      active(),
      active().eq("stock", 0),
      active().gt("stock", 0).lte("stock", LOW_STOCK),
      active().is("cover_path", null),
      supabase.from("books").select("id", head).not("deleted_at", "is", null),
      supabase.from("categories").select("id", head),
      supabase.from("authors").select("id", head),
      supabase
        .from("books")
        .select("id, title, price, stock, thumbnail_path, created_at, authors(name)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(5),
      supabase
        .from("books")
        .select("id, title, price, stock, thumbnail_path, created_at, authors(name)")
        .is("deleted_at", null)
        .lte("stock", LOW_STOCK)
        .order("stock", { ascending: true })
        .order("title")
        .limit(6),
      supabase.from("profiles").select("email, full_name, role, is_locked, created_at").order("created_at", { ascending: false }),
      supabase.from("book_catalog").select("category_name"),
    ]);

  const recentBooks = (recent.data ?? []) as unknown as RecentBook[];
  const attentionBooks = (attention.data ?? []) as unknown as RecentBook[];
  const accountRows = (accounts.data ?? []) as unknown as AccountRow[];
  const admins = accountRows.filter((a) => a.role === "admin").length;
  const locked = accountRows.filter((a) => a.is_locked).length;

  // Books per category for the bar list.
  const perCategory = new Map<string, number>();
  for (const row of (catalogue.data ?? []) as unknown as { category_name: string }[]) {
    perCategory.set(row.category_name, (perCategory.get(row.category_name) ?? 0) + 1);
  }
  const categoryBars = [...perCategory.entries()].sort((a, b) => b[1] - a[1]);
  const maxBar = Math.max(1, ...categoryBars.map(([, n]) => n));

  const stats = [
    { label: "Books on sale", value: onSale.count ?? 0, href: "/admin/books", Icon: IconBook, tone: "brand" },
    { label: "Out of stock", value: outOfStock.count ?? 0, href: "/admin/books?filter=out", Icon: IconAlert, tone: "red" },
    { label: `Low stock (≤ ${LOW_STOCK})`, value: lowStock.count ?? 0, href: "/admin/books?filter=low", Icon: IconAlert, tone: "amber" },
    { label: "Missing cover", value: noCover.count ?? 0, href: "/admin/books?filter=nocover", Icon: IconImage, tone: "stone" },
    { label: "Deleted (hidden)", value: deleted.count ?? 0, href: "/admin/books?show=deleted", Icon: IconTrash, tone: "stone" },
    { label: "Accounts", value: accountRows.length, href: "/admin/users", Icon: IconUsers, tone: "brand", sub: `${admins} admin · ${locked} locked` },
  ] as const;

  const toneClass: Record<string, string> = {
    brand: "bg-brand-50 text-brand-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    stone: "bg-stone-100 text-stone-500",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of the catalogue and accounts."
        actions={
          <>
            <Link href="/admin/users" className="btn-outline">
              <IconUsers /> Create account
            </Link>
            <Link href="/admin/books/new" className="btn-accent">
              <IconPlus /> Add a book
            </Link>
          </>
        }
      />

      {/* KPI cards */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card flex items-center gap-4 p-4 transition hover:border-brand-500 hover:shadow">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClass[s.tone]}`}>
                <s.Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl leading-none font-bold text-stone-900">{s.value}</span>
                <span className="mt-1 block truncate text-sm text-stone-600">{s.label}</span>
                {"sub" in s && <span className="block text-xs text-stone-400">{s.sub}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recently added */}
        <section className="card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
            <h2 className="font-sans text-base font-semibold">Recently added books</h2>
            <Link href="/admin/books" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {recentBooks.map((b) => (
              <BookLine key={b.id} book={b} meta={formatDate(b.created_at)} />
            ))}
            {recentBooks.length === 0 && <li className="px-5 py-6 text-sm text-stone-500">No books yet.</li>}
          </ul>
        </section>

        {/* Needs attention */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
            <h2 className="font-sans text-base font-semibold">Needs restocking</h2>
            <Link href="/admin/books?filter=low" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {attentionBooks.map((b) => (
              <BookLine key={b.id} book={b} meta={<StockBadge stock={b.stock} />} compact />
            ))}
            {attentionBooks.length === 0 && (
              <li className="px-5 py-6 text-sm text-stone-500">All books have more than {LOW_STOCK} in stock.</li>
            )}
          </ul>
        </section>

        {/* Books per category */}
        <section className="card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
            <h2 className="font-sans text-base font-semibold">Books per category</h2>
            <span className="text-xs text-stone-500">
              {categories.count ?? 0} categories · {authors.count ?? 0} authors
            </span>
          </div>
          <ul className="space-y-3 px-5 py-4">
            {categoryBars.map(([name, n]) => (
              <li key={name} className="grid grid-cols-[140px_1fr_32px] items-center gap-3 text-sm sm:grid-cols-[200px_1fr_32px]">
                <span className="truncate text-stone-700">{name}</span>
                <span className="h-2.5 rounded-full bg-stone-100">
                  <span className="block h-2.5 rounded-full bg-brand-500" style={{ width: `${(n / maxBar) * 100}%` }} />
                </span>
                <span className="text-right font-semibold text-stone-800">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Latest accounts */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
            <h2 className="font-sans text-base font-semibold">Latest accounts</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-brand-600 hover:underline">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {accountRows.slice(0, 5).map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-stone-800">{a.full_name || a.email}</span>
                  <span className="block truncate text-xs text-stone-500">{a.email}</span>
                </span>
                <span className="flex shrink-0 gap-1">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${a.role === "admin" ? "bg-accent-400/20 text-accent-600" : "bg-stone-100 text-stone-600"}`}
                  >
                    {a.role === "admin" ? "Admin" : "Customer"}
                  </span>
                  {a.is_locked && <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Locked</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Out of stock</span>;
  return <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{stock} left</span>;
}

function BookLine({ book, meta, compact = false }: { book: RecentBook; meta: React.ReactNode; compact?: boolean }) {
  return (
    <li>
      <Link href={`/admin/books/${book.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl(book.thumbnail_path)} alt="" width={32} height={48} className="h-12 w-8 shrink-0 rounded object-cover" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-stone-800">{book.title}</span>
          <span className="block truncate text-xs text-stone-500">
            {book.authors?.name}
            {!compact && <> · {formatPrice(book.price)}</>}
          </span>
        </span>
        <span className="shrink-0 text-xs text-stone-500">{meta}</span>
      </Link>
    </li>
  );
}
