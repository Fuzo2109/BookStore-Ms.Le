"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type Props = { categories: { id: number; name: string }[] };

/** "Categories" item of the main menu: opens on hover (desktop) or click/tap, lists every category. */
export function CategoriesMenu({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  // true while the menu is open because the mouse is over it, so a click then keeps it open instead of toggling
  const openedByHover = useRef(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return; // touch/pen: open on tap only
        openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        openedByHover.current = false;
        setOpen(false);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-brand-600"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
          } else {
            setOpen((v) => !v);
          }
        }}
      >
        Categories
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </button>

      {open && (
        // pt-2 keeps the hover area continuous between the button and the panel;
        // right-aligned on phones so the panel stays inside a 375 px screen; left-aligned from sm up
        <div id={menuId} className="absolute right-0 top-full z-50 pt-2 sm:left-0 sm:right-auto">
          <ul className="max-h-[70vh] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
            {categories.length === 0 ? (
              <li className="px-4 py-2 text-stone-500">No categories yet</li>
            ) : (
              categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/books?category=${c.id}`}
                    className="block px-4 py-2 font-normal text-stone-700 hover:bg-brand-50 hover:text-brand-700"
                    onClick={() => setOpen(false)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))
            )}
            <li className="mt-1 border-t border-stone-100">
              <Link
                href="/books"
                className="block px-4 py-2 font-medium text-brand-700 hover:bg-brand-50"
                onClick={() => setOpen(false)}
              >
                All books →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </li>
  );
}
