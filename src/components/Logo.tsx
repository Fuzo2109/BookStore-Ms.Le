import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Ms. Le Bookstore home">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="18" fill="#22704f" />
        <path
          d="M8 12 Q13 9.5 18 12 Q23 9.5 28 12 L28 26 Q23 23.5 18 26 Q13 23.5 8 26 Z M18 12 L18 26"
          fill="none"
          stroke="#fbf8f2"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-serif text-xl font-bold leading-none text-brand-700">
        Ms. Le <span className="text-accent-500">Books</span>
      </span>
    </Link>
  );
}
