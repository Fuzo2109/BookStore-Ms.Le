"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-stone-600">Please try again. If the problem continues, contact the administrator.</p>
      {error.digest && <p className="mt-2 text-xs text-stone-400">Reference: {error.digest}</p>}
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
