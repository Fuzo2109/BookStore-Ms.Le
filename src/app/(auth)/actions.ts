"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, formValues, loginSchema, registerSchema, safeRedirectPath } from "@/lib/validation";
import type { FormState } from "@/lib/types";

const LOCKED_MESSAGE = "This account has been locked. Please contact the administrator.";

/** F1 – log in. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "user_banned") return { error: LOCKED_MESSAGE, values };
    if (error.code === "email_not_confirmed")
      return { error: "Please confirm your email address before logging in.", values };
    // Same message for wrong email or wrong password (do not reveal which one).
    return { error: "Incorrect email or password.", values };
  }

  // Defence in depth: also honour the is_locked flag in profiles.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_locked")
    .eq("id", data.user.id)
    .maybeSingle();
  if ((profile as unknown as { is_locked: boolean } | null)?.is_locked) {
    await supabase.auth.signOut();
    return { error: LOCKED_MESSAGE, values };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirectPath(formData.get("next"), "/"));
}

/** F1 – register a new Customer account. */
export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["fullName", "email"]);
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message))
      return { fieldErrors: { email: "An account with this email already exists." }, values };
    if (error.code === "weak_password") return { fieldErrors: { password: error.message }, values };
    return { error: `Registration failed: ${error.message}`, values };
  }

  // With "Confirm email" turned off in Supabase the user is signed in straight away.
  if (!data.session) {
    return { success: "Account created. Check your inbox to confirm your email, then log in." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/** F1 – log out. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
