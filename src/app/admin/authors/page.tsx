import type { Metadata } from "next";
import { NameManager } from "../taxonomy/NameManager";
import { loadWithBookCounts } from "../taxonomy/load";

export const metadata: Metadata = { title: "Manage authors" };

export default async function AuthorsPage() {
  const items = await loadWithBookCounts("authors");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Authors</h1>
      <NameManager table="authors" label="author" items={items} />
    </div>
  );
}
