import type { Metadata } from "next";
import { NameManager } from "../taxonomy/NameManager";
import { loadWithBookCounts } from "../taxonomy/load";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Manage categories" };

export default async function CategoriesPage() {
  const items = await loadWithBookCounts("categories");
  return (
    <div>
      <PageHeader
        title="Categories"
        description="Book categories shown in the store filters. A category used by any book cannot be deleted."
        crumbs={[{ href: "/admin", label: "Dashboard" }]}
      />
      <NameManager table="categories" label="category" items={items} />
    </div>
  );
}
