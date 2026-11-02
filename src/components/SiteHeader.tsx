import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { SearchBox } from "@/components/SearchBox";
import { Logo } from "@/components/Logo";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      {/* Promo bar */}
      <div className="bg-brand-700 px-4 py-1.5 text-center text-xs font-medium text-white sm:text-sm">
        Welcome to Ms. Le Bookstore — browse our catalogue online, then find your next book in store.
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Logo />

        <div className="order-3 w-full md:order-2 md:w-auto md:flex-1">
          <SearchBox />
        </div>

        <nav className="order-2 ml-auto flex items-center gap-2 text-sm md:order-3" aria-label="Account">
          {user ? (
            <>
              <span className="hidden text-stone-600 lg:inline">
                Hi, <strong className="text-stone-800">{user.fullName || user.email}</strong>
              </span>
              {user.role === "admin" && (
                <Link href="/admin" className="btn-outline px-3 py-1.5">
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="btn-outline px-3 py-1.5">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline px-3 py-1.5">
                Log in
              </Link>
              <Link href="/register" className="btn-primary px-3 py-1.5">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      <nav className="border-t border-stone-100" aria-label="Main">
        <ul className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm font-medium text-stone-700">
          <li>
            <Link href="/books" className="hover:text-brand-600">
              All books
            </Link>
          </li>
          <li>
            <Link href="/books" className="hover:text-brand-600">
              New arrivals
            </Link>
          </li>
          <li>
            <Link href="/#categories" className="hover:text-brand-600">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/books?maxPrice=100000" className="hover:text-brand-600">
              Under 100.000 ₫
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
