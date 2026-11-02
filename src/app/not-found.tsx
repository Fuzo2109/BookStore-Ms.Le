import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-stone-600">The page you are looking for does not exist.</p>
      <Link href="/books" className="btn-primary mt-6">
        Browse books
      </Link>
    </div>
  );
}
