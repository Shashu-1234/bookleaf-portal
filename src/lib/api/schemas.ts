import { z } from "zod";

import { ticketCategorySchema, ticketPrioritySchema } from "../ai/schemas";

export const ticketStatusSchema = z.enum(["Open", "In Progress", "Resolved", "Closed"]);
export const ticketCodeSchema = z.string().regex(/^BL-\d+$/, "Ticket ID must use the BL-1049 format.");

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().max(100).optional(),
  status: ticketStatusSchema.optional(),
  category: ticketCategorySchema.optional(),
  priority: ticketPrioritySchema.optional(),
  createdAfter: z.iso.datetime({ offset: true }).optional(),
}).strict();

export const messageListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const createTicketSchema = z.object({
  bookId: z.string().regex(/^BK\d{3,}$/).nullable().default(null),
  subject: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(4000),
}).strict();

export const updateTicketSchema = z.object({
  category: ticketCategorySchema.optional(),
  priority: ticketPrioritySchema.optional(),
  status: ticketStatusSchema.optional(),
  assignedTo: z.union([z.literal("self"), z.uuid(), z.null()]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");

export const createMessageSchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();
export const createNoteSchema = z.object({ body: z.string().trim().min(1).max(4000) }).strict();

export function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}
