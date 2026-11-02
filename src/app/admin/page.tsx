import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const head = { count: "exact", head: true } as const;

  const results = await Promise.all([
    supabase.from("books").select("id", head).is("deleted_at", null),
    supabase.from("books").select("id", head).not("deleted_at", "is", null),
    supabase.from("categories").select("id", head),
    supabase.from("authors").select("id", head),
    supabase.from("profiles").select("id", head),
  ]);
  const [books, hidden, categories, authors, accounts] = results.map((r) => r.count ?? 0);

  const tiles = [
    { label: "Books on sale", value: books, href: "/admin/books" },
    { label: "Deleted (hidden) books", value: hidden, href: "/admin/books?show=deleted" },
    { label: "Categories", value: categories, href: "/admin/categories" },
    { label: "Authors", value: authors, href: "/admin/authors" },
    { label: "Accounts", value: accounts, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="card block p-5 transition hover:border-brand-500">
              <p className="text-3xl font-bold text-brand-700">{t.value}</p>
              <p className="mt-1 text-sm text-stone-600">{t.label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Link href="/admin/books/new" className="btn-accent">
          + Add a book
        </Link>
      </div>
    </div>
  );
}
