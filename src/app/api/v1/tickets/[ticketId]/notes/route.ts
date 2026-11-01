import { authenticatedRoute } from "@/lib/api/auth";
import { apiSuccess, readJson } from "@/lib/api/http";
import { createNoteSchema, ticketCodeSchema } from "@/lib/api/schemas";
import { createInternalNote } from "@/lib/api/ticket-service";

type Context = { params: Promise<{ ticketId: string }> };

export const POST = authenticatedRoute(["admin", "ops"], async (request, context: Context, auth) => {
  const code = ticketCodeSchema.parse((await context.params).ticketId);
  const note = await createInternalNote(auth.supabase, code, auth.userId, createNoteSchema.parse(await readJson(request)));
  return apiSuccess(note, { status: 201 });
});
