import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client: bypasses Row Level Security.
 * Only call this AFTER requireAdmin() has confirmed the caller is an administrator.
 * Used for: creating/locking accounts (Auth admin API) and uploading cover images.
 */
export function createAdminClient() {
  return createClient(env.supabaseUrl(), env.serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
