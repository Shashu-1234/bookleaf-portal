import { notFound } from "next/navigation";

import { TicketDetail } from "@/features/admin/components/ticket-detail";
import { getAdminTicketByCode } from "@/lib/database/admin-repository";
import { parsePage } from "@/lib/pagination";
import { redirect } from "next/navigation";

export default async function TicketDetailPage({
  params, searchParams,
}: {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { ticketId } = await params;
  const query = await searchParams;
  const detail = await getAdminTicketByCode(ticketId, parsePage(query.messagesPage));
  if (!detail) notFound();
  const { ticket, messagePagination } = detail;
  if (messagePagination.page > messagePagination.totalPages) redirect(`/admin/tickets/${ticketId}${messagePagination.totalPages > 1 ? `?messagesPage=${messagePagination.totalPages}` : ""}`);
  return <TicketDetail ticket={ticket} messagePagination={messagePagination} />;
}
