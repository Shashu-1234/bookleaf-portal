import { z } from "zod";

export const ticketCategories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
] as const;

export const ticketPriorities = ["Critical", "High", "Medium", "Low"] as const;

export const ticketCategorySchema = z.enum(ticketCategories);
export const ticketPrioritySchema = z.enum(ticketPriorities);

export const ticketAnalysisSchema = z.object({
  category: ticketCategorySchema.describe(
    "The single best BookLeaf support category for this ticket.",
  ),
  priority: ticketPrioritySchema.describe(
    "Operational urgency based only on the supplied ticket and policy rubric.",
  ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence from 0 to 1; this is advisory, not a probability guarantee."),
  rationale: z
    .string()
    .min(1)
    .max(400)
    .describe("A concise internal explanation grounded in evidence from the ticket."),
  urgencySignals: z
    .array(z.string().min(1).max(160))
    .max(6)
    .describe("Short phrases identifying the facts that affected priority."),
  needsHumanEscalation: z
    .boolean()
    .describe("Whether an operations specialist should investigate beyond a routine reply."),
});

export const responseDraftSchema = z.object({
  subject: z.string().min(1).max(160),
  body: z
    .string()
    .min(1)
    .max(4000)
    .describe("A complete, empathetic BookLeaf support response ready for admin editing."),
  nextStep: z.string().min(1).max(500),
  missingInformation: z.array(z.string().min(1).max(240)).max(6),
  policyReferences: z
    .array(z.string().min(1).max(160))
    .max(6)
    .describe("Internal policy labels used to create the draft; never sent automatically."),
});

export type TicketCategory = z.infer<typeof ticketCategorySchema>;
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;
export type TicketAnalysis = z.infer<typeof ticketAnalysisSchema>;
export type ResponseDraft = z.infer<typeof responseDraftSchema>;

export function toProviderJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const generated = z.toJSONSchema(schema, { target: "draft-7" }) as Record<
    string,
    unknown
  >;
  const supportedSchema = { ...generated };
  delete supportedSchema.$schema;
  return supportedSchema;
}
