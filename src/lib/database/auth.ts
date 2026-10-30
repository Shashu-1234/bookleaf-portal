import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AuthenticationRequiredError, DatabaseOperationError } from "./errors";
import { createClient } from "../supabase/server";

export type PortalRole = "admin" | "ops" | "author";

export async function requireClaims() {
  // Supabase Auth reads the current time while validating session expiry. Mark
  // this boundary dynamic before creating the client under Cache Components.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    throw new DatabaseOperationError("Unable to validate the current session.", "SESSION_VALIDATION_FAILED", { cause: error });
  }
  if (!data?.claims?.sub) throw new AuthenticationRequiredError();

  return { supabase, claims: data.claims };
}

export async function requireRole(allowed: readonly PortalRole[]) {
  const { supabase, claims } = await requireClaims();
  const appMetadata = claims.app_metadata as { role?: PortalRole } | undefined;
  const role = appMetadata?.role;

  if (!role || !allowed.includes(role)) {
    redirect(role === "author" ? "/author" : role === "admin" || role === "ops" ? "/admin" : "/login?error=access");
  }

  return { supabase, claims, role };
}
