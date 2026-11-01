import { notFound } from "next/navigation";

import { TicketDetail } from "@/features/admin/components/ticket-detail";
import { regenerateAdminDraft } from "@/lib/database/ai-repository";
import { addAdminReply, addInternalNote, getAdminTicketByCode, getAdminTicketDatabaseId, updateAdminTicket } from "@/lib/database/admin-repository";
import { requireRole } from "@/lib/database/auth";
import { revalidatePath } from "next/cache";
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
  async function updateAction(formData: FormData) {
    "use server";
    const id = await getAdminTicketDatabaseId(ticketId);
    const field = String(formData.get("field") ?? "");
    const value = String(formData.get("value") ?? "");
    const payload = field === "assignedTo" ? { assignedTo: value === "self" ? (await requireRole(["admin", "ops"])).claims.sub : null } : { [field]: value };
    await updateAdminTicket(id, payload);
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath("/admin/tickets");
  }
  async function noteAction(formData: FormData) {
    "use server";
    await addInternalNote(await getAdminTicketDatabaseId(ticketId), String(formData.get("body") ?? ""));
    revalidatePath(`/admin/tickets/${ticketId}`);
  }
  async function replyAction(formData: FormData) {
    "use server";
    await addAdminReply(await getAdminTicketDatabaseId(ticketId), String(formData.get("body") ?? ""));
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath(`/author/support/${ticketId}`);
  }
  async function regenerateAction() {
    "use server";
    const result = await regenerateAdminDraft(await getAdminTicketDatabaseId(ticketId));
    revalidatePath(`/admin/tickets/${ticketId}`);
    return result;
  }
  return <TicketDetail ticket={ticket} messagePagination={messagePagination} updateAction={updateAction} noteAction={noteAction} replyAction={replyAction} regenerateAction={regenerateAction} />;
}
