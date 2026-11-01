import { after } from "next/server";

import { authenticatedRoute } from "@/lib/api/auth";
import { apiSuccess, readJson } from "@/lib/api/http";
import { createTicketSchema, queryObject, ticketListQuerySchema } from "@/lib/api/schemas";
import { createTicket, listTickets } from "@/lib/api/ticket-service";
import { processNewTicketAi } from "@/lib/database/ai-repository";

export const GET = authenticatedRoute(["admin", "ops", "author"], async (request, _context, auth) => {
  const result = await listTickets(auth.supabase, ticketListQuerySchema.parse(queryObject(request)));
  return apiSuccess(result.data, { meta: result.meta });
});

export const POST = authenticatedRoute(["author"], async (request, _context, auth) => {
  const created = await createTicket(auth.supabase, auth.userId, createTicketSchema.parse(await readJson(request)));
  after(async () => {
    try {
      await processNewTicketAi(created.internalId);
    } catch (error) {
      console.error("[api] Ticket AI processing failed safely", { ticketId: created.internalId, error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  return apiSuccess(created.data, { status: 201, headers: { location: `/api/v1/tickets/${created.data.id}` } });
});
