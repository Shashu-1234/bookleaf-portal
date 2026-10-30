import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Keep this call immediately after client creation. It validates and refreshes
  // asymmetric JWTs without trusting an unverified cookie session.
  const { data } = await supabase.auth.getClaims();
  const pathname = request.nextUrl.pathname;
  const role = (data?.claims?.app_metadata as { role?: string } | undefined)?.role;
  const destination = role === "author" ? "/author" : role === "admin" || role === "ops" ? "/admin" : null;

  let redirectTo: string | null = null;
  if ((pathname.startsWith("/admin") || pathname.startsWith("/author")) && !data?.claims?.sub) redirectTo = `/login?next=${encodeURIComponent(pathname)}`;
  else if (pathname.startsWith("/admin") && role === "author") redirectTo = "/author";
  else if (pathname.startsWith("/author") && (role === "admin" || role === "ops")) redirectTo = "/admin";
  else if (pathname === "/login" && destination) redirectTo = destination;

  if (!redirectTo) return response;
  const redirectResponse = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}
