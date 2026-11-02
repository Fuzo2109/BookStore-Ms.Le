import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { AdminMobileNav, AdminNav } from "@/components/admin/AdminNav";
import { IconLogout, IconStore } from "@/components/admin/icons";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Ms. Le Bookstore" } };

/**
 * Admin portal shell – separate from the storefront: sidebar navigation, top bar, no shop header/footer.
 * Every /admin page is guarded on the server (F1); each action re-checks with requireAdmin().
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const initials = (admin.fullName || admin.email)
    .split(/\s+/)
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-stone-100 lg:grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-brand-900 px-3 py-5 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2 px-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 font-serif text-lg font-bold text-white">
            L
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-base font-bold text-white">Ms. Le Books</span>
            <span className="block text-xs text-brand-200">Admin portal</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <AdminNav />
        </div>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
          >
            <IconStore className="text-brand-200" /> View store
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-brand-100 hover:bg-white/10 hover:text-white"
            >
              <IconLogout className="text-brand-200" /> Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-stone-200 bg-white px-4 lg:px-8">
          <AdminMobileNav />
          <Link href="/admin" className="font-serif text-lg font-bold text-brand-700 lg:hidden">
            Admin
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="btn-outline hidden px-3 py-1.5 sm:inline-flex">
              <IconStore /> View store
            </Link>
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="hidden text-sm leading-tight md:block">
                <span className="block font-semibold text-stone-800">{admin.fullName || "Administrator"}</span>
                <span className="block text-xs text-stone-500">{admin.email}</span>
              </span>
            </div>
            <form action={logout} className="lg:hidden">
              <button type="submit" className="rounded-md p-2 text-stone-600 hover:bg-stone-100" title="Log out">
                <IconLogout />
                <span className="sr-only">Log out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
