import { redirect } from "next/navigation";
import { getAdminTicketQueue } from "@/lib/database/admin-repository";
import { parsePage } from "@/lib/pagination";
import { TicketQueue } from "./ticket-queue";

export async function FocusedQueue({ searchParams, mode }: { searchParams: Promise<Record<string, string | string[] | undefined>>; mode: "assigned" | "review" }) {
  const params = await searchParams;
  const value = (key: string) => Array.isArray(params[key]) ? params[key]?.[0] : params[key];
  const basePath = `/admin/${mode}`;
  const result = await getAdminTicketQueue({ page: parsePage(params.page), search: value("q"), status: value("status"), category: value("category"), priority: value("priority"), age: value("age"), assignment: mode === "assigned" ? "Mine" : value("assignment"), review: mode === "review" });
  if (result.pagination.page > result.pagination.totalPages) {
    const next = new URLSearchParams();
    for (const [key, item] of Object.entries(params)) if (key !== "page" && typeof item === "string") next.set(key, item);
    if (result.pagination.totalPages > 1) next.set("page", String(result.pagination.totalPages));
    redirect(`${basePath}${next.size ? `?${next}` : ""}`);
  }
  return <TicketQueue {...result} basePath={basePath} title={mode === "assigned" ? "My assigned tickets" : "Needs review"} assignedOnly={mode === "assigned"} description={mode === "assigned" ? "Tickets assigned to your signed-in staff account, ordered by urgency and age." : "Open and in-progress tickets whose latest AI run requires manual review, including tickets with no AI run yet."} />;
}
