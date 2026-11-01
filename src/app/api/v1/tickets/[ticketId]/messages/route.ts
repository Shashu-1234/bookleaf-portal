import { authenticatedRoute } from "@/lib/api/auth";
import { apiSuccess, readJson } from "@/lib/api/http";
import { createMessageSchema, messageListQuerySchema, queryObject, ticketCodeSchema } from "@/lib/api/schemas";
import { createMessage, listMessages } from "@/lib/api/ticket-service";

type Context = { params: Promise<{ ticketId: string }> };

export const GET = authenticatedRoute(["admin", "ops", "author"], async (request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  const result = await listMessages(auth.supabase, code, messageListQuerySchema.parse(queryObject(request)));
  return apiSuccess(result.data, { meta: result.meta });
});

export const POST = authenticatedRoute(["admin", "ops", "author"], async (request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  const message = await createMessage(auth.supabase, code, auth.userId, auth.role, createMessageSchema.parse(await readJson(request)));
  return apiSuccess(message, { status: 201, headers: { location: `/api/v1/tickets/${code}/messages/${message.id}` } });
});
