import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Access denied" };

/** F1: shown when a signed-in non-admin tries to open an admin page. */
export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl" aria-hidden="true">
        🔒
      </p>
      <h1 className="mt-4 text-2xl font-bold">Access denied</h1>
      <p className="mt-2 text-stone-600">You do not have permission to open this page.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to the home page
      </Link>
    </div>
  );
}
