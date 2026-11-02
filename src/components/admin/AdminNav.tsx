"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconBook, IconDashboard, IconMenu, IconPen, IconPlus, IconTag, IconUsers } from "./icons";

const groups = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", Icon: IconDashboard }] },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/books", label: "Books", Icon: IconBook },
      { href: "/admin/books/new", label: "Add a book", Icon: IconPlus },
      { href: "/admin/categories", label: "Categories", Icon: IconTag },
      { href: "/admin/authors", label: "Authors", Icon: IconPen },
    ],
  },
  { label: "System", items: [{ href: "/admin/users", label: "Accounts", Icon: IconUsers }] },
];

const allHrefs = groups.flatMap((g) => g.items.map((i) => i.href));

/** The most specific menu entry matching the current URL is highlighted. */
function activeHref(pathname: string): string | undefined {
  return allHrefs
    .filter((h) => pathname === h || pathname.startsWith(`${h}/`))
    .sort((a, b) => b.length - a.length)[0];
}

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = activeHref(pathname);

  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-brand-200/70 uppercase">{g.label}</p>
          <ul className="mt-2 space-y-1">
            {g.items.map(({ href, label, Icon }) => {
              const isActive = href === active;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-brand-100 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className={isActive ? "text-accent-400" : "text-brand-200"} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Slide-down menu for phones and tablets; closes after navigating. */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        className="rounded-md p-2 text-stone-700 hover:bg-stone-100"
      >
        <IconMenu />
        <span className="sr-only">Menu</span>
      </button>
      {open && (
        <div id="admin-mobile-nav" className="absolute inset-x-0 top-full z-20 bg-brand-900 p-4 shadow-lg">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
