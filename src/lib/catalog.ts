import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, sanitizeSearch, type CatalogParams } from "@/lib/catalog-params";
import type { Author, CatalogBook, Category } from "@/lib/types";

const LIST_COLUMNS = "id, title, price, stock, thumbnail_path, author_name, category_id, category_name, created_at";

export type CatalogListItem = Pick<
  CatalogBook,
  "id" | "title" | "price" | "stock" | "thumbnail_path" | "author_name" | "category_id" | "category_name" | "created_at"
>;

/**
 * F3 + F5: one page of the catalogue (12 per page, newest first),
 * optionally searched by title/author and filtered by category and price range.
 */
export async function listBooks(params: CatalogParams): Promise<{ books: CatalogListItem[]; total: number }> {
  const supabase = await createClient();

  const build = (head: boolean) => {
    let query = supabase.from("book_catalog").select(LIST_COLUMNS, { count: "exact", head });
    const q = sanitizeSearch(params.q);
    if (q) query = query.or(`title.ilike.%${q}%,author_name.ilike.%${q}%`);
    if (params.category) query = query.eq("category_id", params.category);
    if (params.minPrice !== undefined) query = query.gte("price", params.minPrice);
    if (params.maxPrice !== undefined) query = query.lte("price", params.maxPrice);
    return query;
  };

  const from = (params.page - 1) * PAGE_SIZE;
  const { data, count, error } = await build(false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    // Page number beyond the last page: return no rows but the real total.
    if (error.code === "PGRST103") {
      const { count: total } = await build(true);
      return { books: [], total: total ?? 0 };
    }
    throw new Error(`Could not load books: ${error.message}`);
  }

  return { books: (data ?? []) as unknown as CatalogListItem[], total: count ?? 0 };
}

/** F4: a single visible book, or null if the id is invalid / missing / deleted. */
export async function getBook(rawId: string): Promise<CatalogBook | null> {
  if (!/^\d{1,15}$/.test(rawId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("book_catalog").select("*").eq("id", Number(rawId)).maybeSingle();
  if (error) throw new Error(`Could not load book: ${error.message}`);
  return (data ?? null) as unknown as CatalogBook | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return (data ?? []) as unknown as Category[];
}

export async function getAuthors(): Promise<Author[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("authors").select("id, name").order("name");
  if (error) throw new Error(`Could not load authors: ${error.message}`);
  return (data ?? []) as unknown as Author[];
}
