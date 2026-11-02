import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Taxonomy } from "./actions";

/** Names plus how many books (including soft-deleted ones) reference each. */
export async function loadWithBookCounts(table: Taxonomy) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select("id, name, books(count)").order("name");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as { id: number; name: string; books: { count: number }[] }[];
  return rows.map((r) => ({ id: r.id, name: r.name, books: r.books?.[0]?.count ?? 0 }));
}
