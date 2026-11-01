import "server-only";

import { cache } from "react";
import { z } from "zod";

import type {
  AdminOverviewTicket,
  AdminTicket,
  AdminTicketQueueItem,
} from "@/features/admin/types";
import { ticketCategorySchema, ticketPrioritySchema } from "@/lib/ai/schemas";
import { MESSAGES_PAGE_SIZE, pageRange, paginationMeta, TICKETS_PAGE_SIZE } from "@/lib/pagination";

import { requireRole } from "./auth";
import { DatabaseOperationError } from "./errors";

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function ageHours(createdAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 3_600_000));
}

function ticketNumberFromCode(code: string) {
  return z
    .string()
    .regex(/^BL-\d+$/)
    .transform((value) => Number(value.slice(3)))
    .parse(code);
}

export const getAdminOverviewData = cache(async (): Promise<AdminOverviewTicket[]> => {
  const { supabase } = await requireRole(["admin", "ops"]);
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      ticket_number, subject, priority, status, created_at,
      authors(name),
      books(title),
      staff_profiles(display_name),
      ai_runs(state, created_at)
    `)
    .order("created_at", { ascending: true });

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the operations overview.",
      "ADMIN_OVERVIEW_QUERY_FAILED",
      { cause: error },
    );
  }

  return data.map((ticket) => {
    const latestAiRun = ticket.ai_runs.toSorted((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )[0];
    return {
      id: `BL-${ticket.ticket_number}`,
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      ageHours: ageHours(ticket.created_at),
      assignedTo: ticket.staff_profiles?.display_name ?? null,
      author: { name: ticket.authors.name },
      book: ticket.books ? { title: ticket.books.title } : null,
      ai: { state: latestAiRun?.state === "ready" ? "ready" : "manual_review" },
    };
  });
});

const ticketStatusSchema = z.enum(["Open", "In Progress", "Resolved", "Closed"]);
const adminQueueInputSchema = z.object({
  page: z.number().int().positive().max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
  status: ticketStatusSchema.optional().catch(undefined),
  category: ticketCategorySchema.optional().catch(undefined),
  priority: ticketPrioritySchema.optional().catch(undefined),
  age: z.enum(["24h", "3d", "7d"]).optional().catch(undefined),
  assignment: z.enum(["Mine", "Unassigned"]).optional().catch(undefined),
  author: z.string().regex(/^AUTH\d{3,}$/).optional().catch(undefined),
  review: z.boolean().default(false),
});

export const getAdminTicketQueue = cache(async (input: unknown) => {
  const filters = adminQueueInputSchema.parse(input);
  const { supabase, claims } = await requireRole(["admin", "ops"]);
  const { from, to } = pageRange(filters.page, TICKETS_PAGE_SIZE);
  // Check the latest run, not any historical failure. Only minimal triage
  // projections are loaded; the full queue remains paginated below.
  const reviewIds: string[] = [];
  if (filters.review) {
    for (let offset = 0; ; offset += 500) {
      const { data: candidates, error } = await supabase.from("tickets")
        .select("id, ai_runs(state, created_at)")
        .in("status", ["Open", "In Progress"])
        .order("id")
        .order("created_at", { referencedTable: "ai_runs", ascending: false })
        .limit(1, { referencedTable: "ai_runs" }).range(offset, offset + 499);
      if (error) throw new DatabaseOperationError("Unable to load review candidates.", "REVIEW_QUERY_FAILED", { cause: error });
      for (const candidate of candidates) if (candidate.ai_runs[0]?.state !== "ready") reviewIds.push(candidate.id);
      if (candidates.length < 500) break;
    }
  }
  let query = supabase
    .from("tickets")
    .select(`
      ticket_number, subject, description, category, priority, status, created_at,
      authors(name, email),
      books(title, isbn),
      staff_profiles(display_name),
      ai_runs(state, created_at)
    `, { count: "exact" });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.author) query = query.eq("author_id", filters.author);
  if (filters.review) query = query.in("id", reviewIds.length ? reviewIds : ["00000000-0000-0000-0000-000000000000"]);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.assignment === "Mine") query = query.eq("assigned_to", claims.sub);
  if (filters.assignment === "Unassigned") query = query.is("assigned_to", null);
  if (filters.age) {
    const hours = filters.age === "24h" ? 24 : filters.age === "3d" ? 72 : 168;
    query = query.gte("created_at", new Date(Date.now() - hours * 3_600_000).toISOString());
  }
  if (filters.search) {
    const ticketMatch = /^BL-(\d+)$/i.exec(filters.search);
    if (ticketMatch) query = query.eq("ticket_number", Number(ticketMatch[1]));
    else {
      const safeSearch = filters.search.replace(/[%_,()]/g, " ").trim();
      if (safeSearch) query = query.or(`subject.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
    }
  }

  const { data, error, count } = await query
    .order("status", { ascending: true })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .order("ticket_number", { ascending: true })
    .order("created_at", { referencedTable: "ai_runs", ascending: false })
    .limit(1, { referencedTable: "ai_runs" })
    .range(from, to);

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the admin ticket queue.",
      "ADMIN_QUEUE_QUERY_FAILED",
      { cause: error },
    );
  }

  const tickets: AdminTicketQueueItem[] = data.map((ticket) => {
    const latestAiRun = ticket.ai_runs.toSorted((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )[0];
    return {
      id: `BL-${ticket.ticket_number}`,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      ageHours: ageHours(ticket.created_at),
      assignedTo: ticket.staff_profiles?.display_name ?? null,
      author: { name: ticket.authors.name, email: ticket.authors.email },
      book: ticket.books ? { title: ticket.books.title, isbn: ticket.books.isbn } : null,
      ai: { state: latestAiRun?.state === "ready" ? "ready" : "manual_review" },
    };
  });
  return { tickets, filters, pagination: paginationMeta(filters.page, TICKETS_PAGE_SIZE, count) };
});

export const getCurrentStaffProfile = cache(async () => {
  const { supabase, claims } = await requireRole(["admin", "ops"]);
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("display_name")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the support profile.",
      "STAFF_PROFILE_QUERY_FAILED",
      { cause: error },
    );
  }

  return data;
});

export const getAdminTicketByCode = cache(async (code: string, messagePage = 1) => {
  const ticketNumber = ticketNumberFromCode(code);
  const { supabase } = await requireRole(["admin", "ops"]);
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      id, ticket_number, subject, description, category, priority, status, created_at, updated_at,
      authors(id, name, email, city),
      books(id, title, isbn, status, total_copies_sold, royalty_pending, available_on),
      staff_profiles(display_name),
      ai_runs(
        id, state, suggested_category, suggested_priority, confidence, rationale,
        urgency_signals, draft_subject, draft_body, policy_references, provider,
        model, input_tokens, output_tokens, latency_ms, error_code, created_at
      ),
      internal_notes(id, body, created_at)
    `)
    .eq("ticket_number", ticketNumber)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the admin ticket.",
      "ADMIN_TICKET_QUERY_FAILED",
      { cause: error },
    );
  }
  if (!data) return null;

  const { from, to } = pageRange(messagePage, MESSAGES_PAGE_SIZE);
  const { data: messageRows, error: messageError, count: messageCount } = await supabase
    .from("ticket_messages")
    .select("id, sender, sender_name, body, created_at", { count: "exact" })
    .eq("ticket_id", data.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);
  if (messageError) {
    throw new DatabaseOperationError("Unable to load the ticket conversation.", "ADMIN_MESSAGES_QUERY_FAILED", { cause: messageError });
  }

  const aiRuns = data.ai_runs.toSorted((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const ai = aiRuns[0];
  const usableDraft = aiRuns.find((run) => run.draft_body);

  const ticket: AdminTicket = {
    id: `BL-${data.ticket_number}`,
    subject: data.subject,
    description: data.description,
    category: data.category,
    aiCategory: ai?.suggested_category ?? null,
    priority: data.priority,
    aiPriority: ai?.suggested_priority ?? null,
    status: data.status,
    createdAt: dateTimeFormatter.format(new Date(data.created_at)),
    ageHours: ageHours(data.created_at),
    updatedAt: dateTimeFormatter.format(new Date(data.updated_at)),
    assignedTo: data.staff_profiles?.display_name ?? null,
    author: {
      id: data.authors.id,
      name: data.authors.name,
      email: data.authors.email,
      city: data.authors.city ?? "Not provided",
    },
    book: data.books
      ? {
          id: data.books.id,
          title: data.books.title,
          isbn: data.books.isbn,
          status: data.books.status,
          totalCopiesSold: data.books.total_copies_sold,
          royaltyPending: Number(data.books.royalty_pending),
          availableOn: data.books.available_on,
        }
      : null,
    ai: {
      state: ai?.state === "ready" ? "ready" : "manual_review",
      confidence: ai?.confidence ?? null,
      rationale: ai?.rationale ?? null,
      urgencySignals: ai?.urgency_signals ?? [],
      provider: ai?.provider ?? null,
      model: ai?.model ?? null,
      inputTokens: ai?.input_tokens ?? null,
      outputTokens: ai?.output_tokens ?? null,
      latencyMs: ai?.latency_ms ?? null,
      errorCode: ai?.error_code ?? null,
    },
    draft: usableDraft?.draft_body
      ? {
          subject: usableDraft.draft_subject ?? data.subject,
          body: usableDraft.draft_body,
          policyReferences: usableDraft.policy_references,
        }
      : null,
    messages: messageRows
      .toReversed()
      .map((message) => ({
        id: message.id,
        sender: message.sender,
        senderName: message.sender_name,
        body: message.body,
        createdAt: dateTimeFormatter.format(new Date(message.created_at)),
      })),
    internalNotes: data.internal_notes
      .toSorted((a, b) => a.created_at.localeCompare(b.created_at))
      .map((note) => ({
        id: note.id,
        author: "BookLeaf Support",
        body: note.body,
        createdAt: dateTimeFormatter.format(new Date(note.created_at)),
      })),
    activity: [
      {
        id: `${data.id}-created`,
        label: "Ticket created",
        detail: `Submitted by ${data.authors.name}`,
        createdAt: dateTimeFormatter.format(new Date(data.created_at)),
      },
      ...aiRuns.map((run) => ({
        id: run.id,
        label:
          run.state === "ready"
            ? run.draft_body
              ? "AI triage and draft available"
              : "AI triage available"
            : "Manual review mode",
        detail: run.rationale ?? "Provider unavailable; human workflow preserved",
        createdAt: dateTimeFormatter.format(new Date(run.created_at)),
      })),
    ],
  };
  return { ticket, messagePagination: paginationMeta(messagePage, MESSAGES_PAGE_SIZE, messageCount) };
});

export async function getAdminTicketDatabaseId(code: string) {
  const ticketNumber = ticketNumberFromCode(code);
  const { supabase } = await requireRole(["admin", "ops"]);
  const { data, error } = await supabase
    .from("tickets")
    .select("id")
    .eq("ticket_number", ticketNumber)
    .single();
  if (error) {
    throw new DatabaseOperationError(
      "The support ticket could not be found.",
      "TICKET_NOT_FOUND",
      { cause: error },
    );
  }
  return data.id;
}

export async function updateAdminTicket(ticketId: string, input: unknown) {
  const id = z.string().uuid().parse(ticketId);
  const value = z
    .object({
      category: ticketCategorySchema.optional(),
      priority: ticketPrioritySchema.optional(),
      status: ticketStatusSchema.optional(),
      assignedTo: z.string().uuid().nullable().optional(),
    })
    .strict()
    .parse(input);
  const { supabase } = await requireRole(["admin", "ops"]);
  const { error } = await supabase
    .from("tickets")
    .update({
      category: value.category,
      priority: value.priority,
      status: value.status,
      assigned_to: value.assignedTo,
    })
    .eq("id", id);
  if (error) {
    throw new DatabaseOperationError(
      "Unable to update the ticket.",
      "TICKET_UPDATE_FAILED",
      { cause: error },
    );
  }
}

export async function addInternalNote(ticketId: string, body: string) {
  const id = z.string().uuid().parse(ticketId);
  const cleanBody = z.string().trim().min(1).max(4000).parse(body);
  const { supabase, claims } = await requireRole(["admin", "ops"]);
  const { error } = await supabase.from("internal_notes").insert({
    ticket_id: id,
    author_user_id: claims.sub,
    body: cleanBody,
  });
  if (error) {
    throw new DatabaseOperationError(
      "Unable to add the internal note.",
      "INTERNAL_NOTE_CREATE_FAILED",
      { cause: error },
    );
  }
}

export async function addAdminReply(ticketId: string, body: string) {
  const id = z.string().uuid().parse(ticketId);
  const cleanBody = z.string().trim().min(1).max(4000).parse(body);
  const { supabase, claims } = await requireRole(["admin", "ops"]);
  const { data: staff, error: staffError } = await supabase
    .from("staff_profiles")
    .select("display_name")
    .eq("user_id", claims.sub)
    .single();
  if (staffError) {
    throw new DatabaseOperationError(
      "Unable to identify the support agent.",
      "STAFF_PROFILE_NOT_FOUND",
      { cause: staffError },
    );
  }

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: id,
    sender: "admin",
    sender_user_id: claims.sub,
    sender_name: staff.display_name,
    body: cleanBody,
  });
  if (error) {
    throw new DatabaseOperationError(
      "Unable to send the response.",
      "ADMIN_REPLY_CREATE_FAILED",
      { cause: error },
    );
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({ status: "In Progress", assigned_to: claims.sub })
    .eq("id", id);
  if (updateError) {
    throw new DatabaseOperationError(
      "The response was saved, but the ticket status could not be updated.",
      "ADMIN_REPLY_STATUS_UPDATE_FAILED",
      { cause: updateError },
    );
  }
}
