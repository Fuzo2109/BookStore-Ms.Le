"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, nameSchema } from "@/lib/validation";
import type { FormState } from "@/lib/types";

/** F2 – categories and authors share the same simple name-only model. */
export type Taxonomy = "categories" | "authors";

const LABEL: Record<Taxonomy, string> = { categories: "category", authors: "author" };

function check(table: string): asserts table is Taxonomy {
  if (table !== "categories" && table !== "authors") throw new Error("Unknown table");
}

function done(table: Taxonomy) {
  revalidatePath(`/admin/${table}`);
  revalidatePath("/admin/books", "layout");
  revalidatePath("/books", "layout");
  revalidatePath("/");
}

function mapError(table: Taxonomy, error: { code?: string; message: string }): string {
  if (error.code === "23505") return `This ${LABEL[table]} already exists.`;
  if (error.code === "23503")
    return `This ${LABEL[table]} is still used by one or more books (including deleted books), so it cannot be deleted.`;
  return error.message;
}

export async function addName(table: Taxonomy, _prev: FormState, formData: FormData): Promise<FormState> {
  check(table);
  await requireAdmin();
  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: { name: String(formData.get("name") ?? "") } };

  const supabase = await createClient();
  const { error } = await supabase.from(table).insert({ name: parsed.data.name });
  if (error) return { error: mapError(table, error), values: { name: parsed.data.name } };

  done(table);
  return { success: `Added “${parsed.data.name}”.` };
}

export async function renameName(table: Taxonomy, id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  check(table);
  await requireAdmin();
  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ name: parsed.data.name }).eq("id", id);
  if (error) return { error: mapError(table, error) };

  done(table);
  return { success: "Saved." };
}

export async function deleteName(table: Taxonomy, id: number): Promise<FormState> {
  check(table);
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: mapError(table, error) };
  done(table);
  return { success: "Deleted." };
}
