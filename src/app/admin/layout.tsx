import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/authors", label: "Authors" },
  { href: "/admin/users", label: "Accounts" },
];

/** Every /admin page is guarded on the server (F1). Actions re-check with requireAdmin(). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">Administration</p>
          <p className="text-sm text-stone-600">Signed in as {admin.email}</p>
        </div>
        <nav aria-label="Admin">
          <ul className="flex flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-stone-200">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-md px-3 py-1.5 text-sm font-medium hover:bg-brand-50">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
}
