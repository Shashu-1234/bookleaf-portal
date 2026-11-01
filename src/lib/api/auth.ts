import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import type { PortalRole } from "@/lib/database/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import { createClient as createCookieClient } from "@/lib/supabase/server";
import { ApiError } from "./errors";
import { apiRoute } from "./http";

export type ApiAuthContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
  role: PortalRole;
  method: "bearer" | "cookie";
};

export async function authenticateApiRequest(request: Request, allowedRoles: readonly PortalRole[]): Promise<ApiAuthContext> {
  const authorization = request.headers.get("authorization");
  let supabase: SupabaseClient<Database>;
  let token: string | undefined;
  let method: ApiAuthContext["method"] = "cookie";

  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!match) throw new ApiError(401, "INVALID_AUTHORIZATION", "Use an Authorization: Bearer <access-token> header.");
    token = match[1];
    method = "bearer";
    const { url, publishableKey } = getSupabaseConfig();
    supabase = createSupabaseClient<Database>(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  } else {
    supabase = await createCookieClient();
  }

  const { data, error } = await supabase.auth.getClaims(token);
  const claims = data?.claims;
  if (error || !claims?.sub) throw new ApiError(401, "AUTHENTICATION_REQUIRED", "A valid session or bearer token is required.");
  const role = (claims.app_metadata as { role?: PortalRole } | undefined)?.role;
  if (!role || !allowedRoles.includes(role)) throw new ApiError(403, "FORBIDDEN", "Your role does not permit this operation.");

  return { supabase, userId: claims.sub, role, method };
}

export function authenticatedRoute<TContext>(allowedRoles: readonly PortalRole[], handler: (request: Request, context: TContext, auth: ApiAuthContext, requestId: string) => Promise<Response>) {
  return apiRoute<TContext>(async (request, context, requestId) => handler(request, context, await authenticateApiRequest(request, allowedRoles), requestId));
}
