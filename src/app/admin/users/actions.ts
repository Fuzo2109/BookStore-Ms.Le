"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createUserSchema, fieldErrors, formValues } from "@/lib/validation";
import type { FormState } from "@/lib/types";

// ~100 years: Supabase Auth's way of disabling sign-in for an account.
const LOCK_DURATION = "876000h";

/** F1 – administrator creates an account (Administrator or Customer). */
export async function createAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData, ["fullName", "email", "role"]);
  const parsed = createUserSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });
  if (error) {
    if (error.code === "email_exists" || /already been registered/i.test(error.message))
      return { fieldErrors: { email: "An account with this email already exists." }, values };
    return { error: `Could not create the account: ${error.message}`, values };
  }

  // The on_auth_user_created trigger made a 'customer' profile; set the chosen role.
  const { error: roleError } = await admin
    .from("profiles")
    .update({ role: parsed.data.role, full_name: parsed.data.fullName })
    .eq("id", data.user.id);
  if (roleError) return { error: `Account created but role not set: ${roleError.message}` };

  revalidatePath("/admin/users");
  return { success: `Created ${parsed.data.role} account ${parsed.data.email}.` };
}

/** F1 – lock / unlock an account. A locked account cannot log in or use admin functions. */
export async function setLocked(userId: string, locked: boolean) {
  const me = await requireAdmin();
  if (userId === me.id) throw new Error("You cannot lock your own account.");

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: locked ? LOCK_DURATION : "none",
  });
  if (authError) throw new Error(authError.message);

  const { error } = await admin.from("profiles").update({ is_locked: locked }).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
