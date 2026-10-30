import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabaseAdminConfig } from "./config";

/**
 * Creates a stateless, server-only client for trusted background work.
 * The secret key bypasses RLS, so this module must never enter a client bundle.
 */
export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminConfig();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
