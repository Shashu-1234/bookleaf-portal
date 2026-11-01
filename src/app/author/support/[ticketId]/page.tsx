import { notFound, redirect } from "next/navigation";

import { SupportTicketDetail } from "@/features/author/components/support-ticket-detail";
import { getAuthorTicketByCode } from "@/lib/database/author-repository";
import { parsePage } from "@/lib/pagination";

export default async function AuthorTicketDetailPage({ params, searchParams }: { params: Promise<{ ticketId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { ticketId } = await params;
  const query = await searchParams;
  const detail = await getAuthorTicketByCode(ticketId, parsePage(query.messagesPage));
  if (!detail) notFound();
  const { ticket, book, author, messagePagination } = detail;
  if (messagePagination.page > messagePagination.totalPages) redirect(`/author/support/${ticketId}${messagePagination.totalPages > 1 ? `?messagesPage=${messagePagination.totalPages}` : ""}`);
  return <SupportTicketDetail ticket={ticket} book={book} author={author} messagePagination={messagePagination} />;
}
