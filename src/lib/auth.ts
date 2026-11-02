import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/lib/types";

/**
 * The signed-in user with their role, or null.
 * Locked accounts are treated as signed out, so locking takes effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_locked")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as unknown as {
    id: string;
    email: string;
    full_name: string;
    role: CurrentUser["role"];
    is_locked: boolean;
  } | null;

  if (!profile || profile.is_locked) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
});

/** Server-side guard for admin pages and actions (F1: block unauthorised users). */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/forbidden");
  return user;
}
