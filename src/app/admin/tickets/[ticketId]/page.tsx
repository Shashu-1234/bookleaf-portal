import { notFound } from "next/navigation";

import { TicketDetail } from "@/features/admin/components/ticket-detail";
import { regenerateAdminDraft } from "@/lib/database/ai-repository";
import { addAdminReply, addInternalNote, getAdminTicketByCode, getAdminTicketDatabaseId, updateAdminTicket } from "@/lib/database/admin-repository";
import { requireRole } from "@/lib/database/auth";
import { revalidatePath } from "next/cache";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = await getAdminTicketByCode(ticketId);
  if (!ticket) notFound();
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
  return <TicketDetail ticket={ticket} updateAction={updateAction} noteAction={noteAction} replyAction={replyAction} regenerateAction={regenerateAction} />;
}
