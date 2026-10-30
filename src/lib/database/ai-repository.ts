import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createTicketAiService } from "@/lib/ai/factory";
import { runDraftRegeneration, runTicketAiWorkflow } from "@/lib/ai/workflow";
import type { DraftResponseInput, TicketInput } from "@/lib/ai/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Tables } from "@/lib/supabase/database.types";

import { requireRole } from "./auth";
import { DatabaseOperationError } from "./errors";

type DatabaseClient = SupabaseClient<Database>;
type TicketWithContext = Tables<"tickets"> & {
  authors: Tables<"authors">;
  books: Tables<"books"> | null;
  ticket_messages: Tables<"ticket_messages">[];
  ai_runs: Tables<"ai_runs">[];
};

async function loadTicketContext(client: DatabaseClient, ticketId: string) {
  const id = z.string().uuid().parse(ticketId);
  const { data, error } = await client
    .from("tickets")
    .select("*, authors(*), books(*), ticket_messages(*), ai_runs(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw new DatabaseOperationError("Unable to load the ticket for AI processing.", "AI_TICKET_QUERY_FAILED", { cause: error });
  }

  return data as TicketWithContext;
}

function toTicketInput(ticket: TicketWithContext): TicketInput {
  const book = ticket.books;

  return {
    ticketId: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    createdAt: ticket.created_at,
    authorName: ticket.authors.name,
    book: book ? {
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      status: book.status,
      publicationDate: book.publication_date,
      mrp: book.mrp === null ? null : Number(book.mrp),
      totalCopiesSold: book.total_copies_sold,
      totalRoyaltyEarned: Number(book.total_royalty_earned),
      royaltyPaid: Number(book.royalty_paid),
      royaltyPending: Number(book.royalty_pending),
      lastRoyaltyPayoutDate: book.last_royalty_payout_date,
      availableOn: book.available_on,
    } : null,
  };
}

function toPublicConversation(ticket: TicketWithContext): DraftResponseInput["publicConversation"] {
  return ticket.ticket_messages
    .toSorted((a, b) => a.created_at.localeCompare(b.created_at))
    .map((message) => ({
      sender: message.sender,
      message: message.body,
      createdAt: message.created_at,
    }));
}

async function persistWorkflowResult(
  client: DatabaseClient,
  result: Awaited<ReturnType<typeof runTicketAiWorkflow>>,
) {
  const { error: auditError } = await client.from("ai_runs").insert(result.audit);
  if (auditError) {
    throw new DatabaseOperationError("Unable to save the AI audit record.", "AI_AUDIT_CREATE_FAILED", { cause: auditError });
  }

  if (result.ticketUpdate) {
    const { error: updateError } = await client
      .from("tickets")
      .update(result.ticketUpdate)
      .eq("id", result.audit.ticket_id);
    if (updateError) {
      throw new DatabaseOperationError("Unable to apply AI triage to the ticket.", "AI_TRIAGE_UPDATE_FAILED", { cause: updateError });
    }
  }
}

export async function processNewTicketAi(ticketId: string) {
  const client = createAdminClient();
  const ticket = await loadTicketContext(client, ticketId);
  const result = await runTicketAiWorkflow(createTicketAiService(), {
    ticket: toTicketInput(ticket),
    publicConversation: toPublicConversation(ticket),
  });

  await persistWorkflowResult(client, result);
  return result;
}

export async function regenerateAdminDraft(ticketId: string) {
  const { supabase } = await requireRole(["admin", "ops"]);
  const ticket = await loadTicketContext(supabase, ticketId);
  const latestAnalysis = ticket.ai_runs
    .toSorted((a, b) => b.created_at.localeCompare(a.created_at))
    .find((run) => run.suggested_category && run.suggested_priority);

  const result = await runDraftRegeneration(createTicketAiService(), {
    ...toTicketInput(ticket),
    analysis: {
      category: ticket.category,
      priority: ticket.priority,
      rationale: latestAnalysis?.rationale ?? "Using the admin-reviewed category and priority.",
    },
    publicConversation: toPublicConversation(ticket),
  });

  await persistWorkflowResult(supabase, result);

  return result.audit.draft_body ? {
    status: "completed" as const,
    draft: result.audit.draft_body,
    policyReferences: result.audit.policy_references ?? [],
  } : {
    status: "manual_review_required" as const,
    reason: result.audit.rationale ?? "AI assistance is unavailable. Continue manually.",
  };
}
