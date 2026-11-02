import type { Metadata } from "next";
import { NameManager } from "../taxonomy/NameManager";
import { loadWithBookCounts } from "../taxonomy/load";

export const metadata: Metadata = { title: "Manage categories" };

export default async function CategoriesPage() {
  const items = await loadWithBookCounts("categories");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <NameManager table="categories" label="category" items={items} />
    </div>
  );
}
