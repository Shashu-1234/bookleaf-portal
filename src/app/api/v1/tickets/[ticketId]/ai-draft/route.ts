import { authenticatedRoute } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/http";
import { ticketCodeSchema } from "@/lib/api/schemas";
import { getTicket } from "@/lib/api/ticket-service";
import { regenerateAdminDraft } from "@/lib/database/ai-repository";

type Context = { params: Promise<{ ticketId: string }> };

export const POST = authenticatedRoute(["admin", "ops"], async (_request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  const ticket = await getTicket(auth.supabase, code);
  return apiSuccess(await regenerateAdminDraft(ticket.internalId));
});
