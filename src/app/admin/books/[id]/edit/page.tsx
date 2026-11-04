import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthors, getCategories } from "@/lib/catalog";
import { coverUrl } from "@/lib/format";
import { FormAlert } from "@/components/FormBits";
import { BookForm } from "../../BookForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Edit book" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ coverError?: string }>;
};

interface BookRow {
  id: number;
  title: string;
  author_id: number;
  category_id: number;
  price: number;
  stock: number;
  description: string;
  cover_path: string | null;
  deleted_at: string | null;
  authors: { name: string } | null;
  format: string | null;
  language: string | null;
  publisher: string | null;
  publication_date: string | null;
  isbn13: string | null;
  isbn10: string | null;
  dimensions: string | null;
  shipping_weight_lbs: number | string | null;
}

export default async function EditBookPage({ params, searchParams }: Props) {
  const [{ id }, { coverError }] = await Promise.all([params, searchParams]);
  if (!/^\d{1,15}$/.test(id)) notFound();

  const supabase = await createClient();
  const [{ data }, authors, categories] = await Promise.all([
    supabase
      .from("books")
      .select("id, title, author_id, category_id, price, stock, description, cover_path, deleted_at, authors(name), format, language, publisher, publication_date, isbn13, isbn10, dimensions, shipping_weight_lbs")
      .eq("id", Number(id))
      .maybeSingle(),
    getAuthors(),
    getCategories(),
  ]);
  const book = data as unknown as BookRow | null;
  if (!book) notFound();

  return (
    <div>
      <PageHeader
        title={`Edit: ${book.title}`}
        description={`Book #${book.id}`}
        crumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/books", label: "Books" }]}
      />
      {book.deleted_at && (
        <p className="mb-4 text-sm text-amber-700">This book is deleted (hidden from customers). Restore it from the book list.</p>
      )}
      {coverError && (
        <div className="mb-4">
          <FormAlert error={`The book was created, but the cover could not be stored: ${coverError} Please upload it again below.`} />
        </div>
      )}
      <BookForm
        authors={authors}
        categories={categories}
        book={{
          id: book.id,
          title: book.title,
          authorName: book.authors?.name ?? "",
          categoryId: String(book.category_id),
          price: String(book.price),
          stock: String(book.stock),
          description: book.description,
          coverUrl: coverUrl(book.cover_path),
          format: book.format ?? "",
          language: book.language ?? "",
          publisher: book.publisher ?? "",
          publicationDate: book.publication_date ?? "",
          isbn13: book.isbn13 ?? "",
          isbn10: book.isbn10 ?? "",
          dimensions: book.dimensions ?? "",
          shippingWeight: book.shipping_weight_lbs == null ? "" : String(Number(book.shipping_weight_lbs)),
        }}
      />
    </div>
  );
}
