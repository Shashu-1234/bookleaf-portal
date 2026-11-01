import type { Metadata } from "next";

import { TicketQueue } from "@/features/admin/components/ticket-queue";
import { getAdminTicketQueue } from "@/lib/database/admin-repository";
import { parsePage } from "@/lib/pagination";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Ticket Queue" };

export default async function TicketQueuePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => Array.isArray(params[key]) ? params[key]?.[0] : params[key];
  const result = await getAdminTicketQueue({
    page: parsePage(params.page), search: value("q"), status: value("status"), category: value("category"),
    priority: value("priority"), age: value("age"), assignment: value("assignment"),
  });
  if (result.pagination.page > result.pagination.totalPages) {
    const next = new URLSearchParams();
    for (const [key, item] of Object.entries(params)) if (key !== "page" && typeof item === "string") next.set(key, item);
    if (result.pagination.totalPages > 1) next.set("page", String(result.pagination.totalPages));
    redirect(`/admin/tickets${next.size ? `?${next}` : ""}`);
  }
  return <TicketQueue {...result} />;
}
