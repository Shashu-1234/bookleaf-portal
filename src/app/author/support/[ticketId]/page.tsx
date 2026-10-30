import { notFound } from "next/navigation";

import { SupportTicketDetail } from "@/features/author/components/support-ticket-detail";
import { addAuthorReply, getAuthorPortalData } from "@/lib/database/author-repository";
import { revalidatePath } from "next/cache";

export default async function AuthorTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const { tickets, books, author } = await getAuthorPortalData();
  const ticket = tickets.find((entry) => entry.id === ticketId);
  if (!ticket) notFound();
  const book = ticket.bookId ? books.find((entry) => entry.id === ticket.bookId) ?? null : null;
  async function replyAction(formData: FormData) {
    "use server";
    await addAuthorReply(ticket!.id.replace("BL-", ""), String(formData.get("body") ?? ""));
    revalidatePath(`/author/support/${ticket!.id}`);
  }
  return <SupportTicketDetail ticket={ticket} book={book} author={author} replyAction={replyAction} />;
}
