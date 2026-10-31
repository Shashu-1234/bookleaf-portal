import { notFound } from "next/navigation";

import { SupportTicketDetail } from "@/features/author/components/support-ticket-detail";
import { addAuthorReply, getAuthorTicketByCode } from "@/lib/database/author-repository";
import { revalidatePath } from "next/cache";

export default async function AuthorTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const detail = await getAuthorTicketByCode(ticketId);
  if (!detail) notFound();
  const { ticket, book, author } = detail;
  async function replyAction(formData: FormData) {
    "use server";
    await addAuthorReply(ticket.id.replace("BL-", ""), String(formData.get("body") ?? ""));
    revalidatePath(`/author/support/${ticket.id}`);
  }
  return <SupportTicketDetail ticket={ticket} book={book} author={author} replyAction={replyAction} />;
}
