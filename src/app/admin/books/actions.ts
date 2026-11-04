"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { removeCoverFiles, uploadCover } from "@/lib/covers";
import { bookDetailsSchema, bookSchema, escapeLike, fieldErrors, formValues } from "@/lib/validation";
import { COVER_FORMAT_MESSAGE, sniffImageType, validateCoverFile } from "@/lib/cover-rules";
import type { FormState } from "@/lib/types";

const DETAIL_FIELDS = ["format", "language", "publisher", "publicationDate", "isbn13", "isbn10", "dimensions", "shippingWeight"];
const FIELDS = ["title", "authorName", "categoryId", "price", "stock", "description", ...DETAIL_FIELDS];

type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * Finds the author by name (case- and space-insensitive) or creates it.
 * The unique index authors_name_ci_unique guarantees no duplicates even if
 * two admins add the same new author at the same time.
 */
async function resolveAuthorId(supabase: Db, name: string): Promise<{ id: number } | { error: string }> {
  const find = async () => {
    const { data, error } = await supabase.from("authors").select("id, name").ilike("name", escapeLike(name)).limit(1);
    if (error) throw new Error(error.message);
    return (data as unknown as { id: number }[] | null)?.[0];
  };

  const existing = await find();
  if (existing) return { id: existing.id };

  const { data, error } = await supabase.from("authors").insert({ name }).select("id").single();
  if (!error) return { id: (data as unknown as { id: number }).id };
  if (error.code === "23505") {
    const again = await find();
    if (again) return { id: again.id };
  }
  return { error: `Could not save the author: ${error.message}` };
}

function dbError(error: { code?: string; message: string }): FormState {
  if (error.code === "23503") return { error: "The selected author or category no longer exists." };
  if (error.code === "23505" && error.message.includes("isbn13"))
    return { fieldErrors: { isbn13: "This ISBN-13 is already used by another book." } };
  if (error.code === "23514") return { error: "Some values are not allowed (price must be > 0, stock ≥ 0)." };
  return { error: `Could not save the book: ${error.message}` };
}

function revalidateCatalogue(id?: number) {
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath("/admin/books");
  revalidatePath("/admin/authors");
  if (id) revalidatePath(`/books/${id}`);
}

/**
 * F2 – create or update a book. `bookId` is bound for edits, undefined for new books.
 * CR-04: an optional JPG/PNG ≤ 2 MB cover is uploaded and a thumbnail generated.
 */
export async function saveBook(bookId: number | undefined, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData, FIELDS);

  const parsed = bookSchema.safeParse(values);
  const details = bookDetailsSchema.safeParse(values);
  if (!parsed.success || !details.success) {
    return {
      fieldErrors: {
        ...(details.success ? {} : fieldErrors(details.error)),
        ...(parsed.success ? {} : fieldErrors(parsed.error)),
      },
      values,
    };
  }

  const coverEntry = formData.get("cover");
  const cover = coverEntry instanceof File && coverEntry.size > 0 ? coverEntry : null;

  // CR-04 AC2/AC3: reject a bad cover BEFORE saving anything.
  if (cover) {
    const coverError =
      validateCoverFile(cover) ??
      (sniffImageType(new Uint8Array(await cover.slice(0, 16).arrayBuffer())) ? null : COVER_FORMAT_MESSAGE);
    if (coverError) return { fieldErrors: { cover: coverError }, values };
  }

  const supabase = await createClient();
  const author = await resolveAuthorId(supabase, parsed.data.authorName);
  if ("error" in author) return { fieldErrors: { authorName: author.error }, values };

  const row = {
    title: parsed.data.title,
    author_id: author.id,
    category_id: parsed.data.categoryId,
    price: parsed.data.price,
    stock: parsed.data.stock,
    description: parsed.data.description,
    format: details.data.format,
    language: details.data.language,
    publisher: details.data.publisher,
    publication_date: details.data.publicationDate,
    isbn13: details.data.isbn13,
    isbn10: details.data.isbn10,
    dimensions: details.data.dimensions,
    shipping_weight_lbs: details.data.shippingWeight,
  };

  let id: number;
  let oldPaths: (string | null)[] = [];

  if (bookId) {
    id = bookId;
    const { data: existing, error } = await supabase
      .from("books")
      .select("id, cover_path, thumbnail_path")
      .eq("id", id)
      .maybeSingle();
    if (error) return { error: error.message, values };
    if (!existing) return { error: "This book no longer exists.", values };
    const e = existing as unknown as { cover_path: string | null; thumbnail_path: string | null };
    oldPaths = [e.cover_path, e.thumbnail_path];

    const { error: updateError } = await supabase.from("books").update(row).eq("id", id);
    if (updateError) return { ...dbError(updateError), values };
  } else {
    const { data, error } = await supabase.from("books").insert(row).select("id").single();
    if (error) return { ...dbError(error), values };
    id = (data as unknown as { id: number }).id;
  }

  if (cover) {
    const uploaded = await uploadCover(id, cover);
    if (!uploaded.ok) {
      // Rare (e.g. storage outage or corrupt image): the book is saved, the cover is not.
      revalidateCatalogue(id);
      if (!bookId) {
        // New book: continue on its edit page so a retry cannot create a duplicate.
        redirect(`/admin/books/${id}/edit?coverError=${encodeURIComponent(uploaded.error)}`);
      }
      return {
        fieldErrors: { cover: uploaded.error },
        error: "Book details were saved, but the cover image could not be stored.",
        values,
      };
    }
    const { error } = await supabase
      .from("books")
      .update({ cover_path: uploaded.coverPath, thumbnail_path: uploaded.thumbnailPath })
      .eq("id", id);
    if (error) return { error: `Cover uploaded but not linked to the book: ${error.message}`, values };
    await removeCoverFiles(oldPaths);
  }

  revalidateCatalogue(id);
  redirect(`/admin/books?saved=${id}`);
}

/** F2 – soft delete: the book is hidden from customers, never hard-deleted. */
export async function softDeleteBook(bookId: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ deleted_at: new Date().toISOString() }).eq("id", bookId);
  if (error) throw new Error(error.message);
  revalidateCatalogue(bookId);
}

export async function restoreBook(bookId: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ deleted_at: null }).eq("id", bookId);
  if (error) throw new Error(error.message);
  revalidateCatalogue(bookId);
}
