import type { Metadata } from "next";
import { getAuthors, getCategories } from "@/lib/catalog";
import { DEFAULT_COVER } from "@/lib/format";
import { BookForm } from "../BookForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Add a book" };

export default async function NewBookPage() {
  const [authors, categories] = await Promise.all([getAuthors(), getCategories()]);
  return (
    <div>
      <PageHeader
        title="Add a book"
        description="Fields marked * are required. The cover is optional (JPG or PNG, max 2 MB)."
        crumbs={[{ href: "/admin", label: "Dashboard" }, { href: "/admin/books", label: "Books" }]}
      />
      <BookForm
        authors={authors}
        categories={categories}
        book={{ title: "", authorId: "", categoryId: "", price: "", stock: "0", description: "", coverUrl: DEFAULT_COVER }}
      />
    </div>
  );
}
