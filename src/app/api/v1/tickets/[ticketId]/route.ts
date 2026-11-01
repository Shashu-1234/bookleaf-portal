import { authenticatedRoute } from "@/lib/api/auth";
import { apiSuccess, readJson } from "@/lib/api/http";
import { ticketCodeSchema, updateTicketSchema } from "@/lib/api/schemas";
import { getTicket, updateTicket } from "@/lib/api/ticket-service";

type Context = { params: Promise<{ ticketId: string }> };

export const GET = authenticatedRoute(["admin", "ops", "author"], async (_request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  return apiSuccess((await getTicket(auth.supabase, code)).data);
});

export const PATCH = authenticatedRoute(["admin", "ops"], async (request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  const input = updateTicketSchema.parse(await readJson(request));
  return apiSuccess(await updateTicket(auth.supabase, code, auth.userId, input));
});
