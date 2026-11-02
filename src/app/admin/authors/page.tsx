import type { Metadata } from "next";
import { NameManager } from "../taxonomy/NameManager";
import { loadWithBookCounts } from "../taxonomy/load";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Manage authors" };

export default async function AuthorsPage() {
  const items = await loadWithBookCounts("authors");
  return (
    <div>
      <PageHeader
        title="Authors"
        description="Authors available when adding a book. An author used by any book cannot be deleted."
        crumbs={[{ href: "/admin", label: "Dashboard" }]}
      />
      <NameManager table="authors" label="author" items={items} />
    </div>
  );
}
