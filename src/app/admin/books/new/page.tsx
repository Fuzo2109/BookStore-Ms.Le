import type { Metadata } from "next";
import { getAuthors, getCategories } from "@/lib/catalog";
import { DEFAULT_COVER } from "@/lib/format";
import { BookForm } from "../BookForm";

export const metadata: Metadata = { title: "Add a book" };

export default async function NewBookPage() {
  const [authors, categories] = await Promise.all([getAuthors(), getCategories()]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add a book</h1>
      <BookForm
        authors={authors}
        categories={categories}
        book={{ title: "", authorId: "", categoryId: "", price: "", stock: "0", description: "", coverUrl: DEFAULT_COVER }}
      />
    </div>
  );
}
