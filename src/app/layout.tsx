import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const merriweather = Merriweather({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: { default: "Ms. Le Bookstore", template: "%s · Ms. Le Bookstore" },
  description: "Browse, search and discover books from Ms. Le's bookstores.",
};

/**
 * Bare shell only. The storefront (`(store)/layout.tsx`) and the admin area
 * (`admin/layout.tsx`) each add their own header and navigation.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
