import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-bold text-white">Ms. Le Bookstore</p>
          <p className="mt-2 text-sm text-brand-200">
            A family of physical bookstores, now with an online catalogue.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Shop</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/books" className="hover:text-white">All books</Link></li>
            <li><Link href="/#categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/books?maxPrice=100000" className="hover:text-white">Under 100.000 ₫</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Account</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/register" className="hover:text-white">Create an account</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">About this site</p>
          <p className="mt-2 text-sm text-brand-200">
            Release 1.0 – Book Catalogue. Built by Group 4 for the HK261 Software Project Management course.
          </p>
        </div>
      </div>
      <p className="border-t border-brand-700 py-4 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} Ms. Le Bookstore
      </p>
    </footer>
  );
}
