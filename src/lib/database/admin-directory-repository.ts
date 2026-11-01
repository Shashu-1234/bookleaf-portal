import "server-only";
import { requireRole } from "./auth";
import { DatabaseOperationError } from "./errors";
import { pageRange, paginationMeta } from "@/lib/pagination";

export async function getAdminAuthors(page: number, search: string) {
  const { supabase } = await requireRole(["admin", "ops"]);
  const { from, to } = pageRange(page, 20);
  let query = supabase.from("authors").select("id, name, email, city, books(id, title, status, royalty_pending, total_royalty_earned)", { count: "exact" });
  const safe = search.slice(0, 100).replace(/[^\p{L}\p{N}@.\s-]/gu, " ").trim();
  if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,id.ilike.%${safe}%`);
  const { data, error, count } = await query.order("id").range(from, to);
  if (error) throw new DatabaseOperationError("Unable to load authors.", "ADMIN_AUTHORS_QUERY_FAILED", { cause: error });
  return { authors: data, pagination: paginationMeta(page, 20, count) };
}

export async function getAdminAiActivity(page: number) {
  const { supabase } = await requireRole(["admin", "ops"]);
  const { from, to } = pageRange(page, 20);
  const { data, error, count } = await supabase.from("ai_runs")
    .select("id, state, provider, model, input_tokens, output_tokens, latency_ms, error_code, created_at, tickets(ticket_number, subject)", { count: "exact" })
    .order("created_at", { ascending: false }).order("id", { ascending: false }).range(from, to);
  if (error) throw new DatabaseOperationError("Unable to load AI activity.", "ADMIN_AI_ACTIVITY_QUERY_FAILED", { cause: error });
  return { runs: data, pagination: paginationMeta(page, 20, count) };
}
