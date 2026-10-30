import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

import type { TicketAiService } from "./service";
import type {
  DraftResponseInput,
  ManualReviewReason,
  ProviderMetadata,
  TicketInput,
} from "./types";

export interface TicketAiWorkflowInput {
  ticket: TicketInput;
  publicConversation: DraftResponseInput["publicConversation"];
}

export interface TicketAiWorkflowResult {
  audit: TablesInsert<"ai_runs">;
  ticketUpdate?: Pick<TablesUpdate<"tickets">, "category" | "priority">;
}

function optionalSum(...values: Array<number | undefined>) {
  const known = values.filter((value): value is number => value !== undefined);
  return known.length > 0 ? known.reduce((total, value) => total + value, 0) : null;
}

function metadataFields(...metadata: Array<ProviderMetadata | undefined>) {
  const available = metadata.filter((entry): entry is ProviderMetadata => Boolean(entry));
  const latest = available.at(-1);

  return {
    provider: latest?.provider ?? null,
    model: latest?.model ?? null,
    input_tokens: optionalSum(...available.map((entry) => entry.usage?.inputTokens)),
    output_tokens: optionalSum(...available.map((entry) => entry.usage?.outputTokens)),
    latency_ms: optionalSum(...available.map((entry) => entry.durationMs)),
  };
}

function manualAudit(ticketId: string, reason: ManualReviewReason): TablesInsert<"ai_runs"> {
  return {
    ticket_id: ticketId,
    state: "manual_review",
    rationale: reason.message,
    error_code: reason.code,
  };
}

export async function runTicketAiWorkflow(
  service: TicketAiService,
  input: TicketAiWorkflowInput,
): Promise<TicketAiWorkflowResult> {
  const analysis = await service.analyzeTicket(input.ticket);

  if (analysis.status === "manual_review_required") {
    return { audit: manualAudit(input.ticket.ticketId, analysis.reason) };
  }

  const draft = await service.draftResponse({
    ...input.ticket,
    analysis: analysis.data,
    publicConversation: input.publicConversation,
  });

  const common: TablesInsert<"ai_runs"> = {
    ticket_id: input.ticket.ticketId,
    state: "ready",
    suggested_category: analysis.data.category,
    suggested_priority: analysis.data.priority,
    confidence: analysis.data.confidence,
    rationale: analysis.data.rationale,
    urgency_signals: analysis.data.urgencySignals,
    ...metadataFields(
      analysis.metadata,
      draft.status === "completed" ? draft.metadata : undefined,
    ),
  };

  if (draft.status === "manual_review_required") {
    common.error_code = `DRAFT_${draft.reason.code}`;
  } else {
    common.draft_subject = draft.data.subject;
    common.draft_body = draft.data.body;
    common.policy_references = draft.data.policyReferences;
  }

  return {
    audit: common,
    ticketUpdate: {
      category: analysis.data.category,
      priority: analysis.data.priority,
    },
  };
}

export async function runDraftRegeneration(
  service: TicketAiService,
  input: DraftResponseInput,
): Promise<TicketAiWorkflowResult> {
  const draft = await service.draftResponse(input);

  if (draft.status === "manual_review_required") {
    return {
      audit: {
        ...manualAudit(input.ticketId, draft.reason),
        suggested_category: input.analysis.category,
        suggested_priority: input.analysis.priority,
      },
    };
  }

  return {
    audit: {
      ticket_id: input.ticketId,
      state: "ready",
      suggested_category: input.analysis.category,
      suggested_priority: input.analysis.priority,
      rationale: input.analysis.rationale,
      draft_subject: draft.data.subject,
      draft_body: draft.data.body,
      policy_references: draft.data.policyReferences,
      ...metadataFields(draft.metadata),
    },
  };
}
