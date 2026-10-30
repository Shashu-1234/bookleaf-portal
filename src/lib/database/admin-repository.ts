import "server-only";

import { cache } from "react";
import { z } from "zod";
import { connection } from "next/server";

import { ticketCategorySchema, ticketPrioritySchema } from "@/lib/ai/schemas";

import { requireClaims, requireRole } from "./auth";
import { DatabaseOperationError } from "./errors";
import type { AdminTicket } from "@/features/admin/types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const getAdminPortalData = cache(async () => {
  await connection();
  const rows = await listAdminTickets();
  const now = Date.now();
  const tickets: AdminTicket[] = rows.map((ticket) => {
    const ai = [...ticket.ai_runs].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const staff = ticket.staff_profiles;
    return {
      id: `BL-${ticket.ticket_number}`,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      aiCategory: ai?.suggested_category ?? null,
      priority: ticket.priority,
      aiPriority: ai?.suggested_priority ?? null,
      status: ticket.status,
      createdAt: dateTimeFormatter.format(new Date(ticket.created_at)),
      ageHours: Math.max(0, Math.floor((now - new Date(ticket.created_at).getTime()) / 3_600_000)),
      updatedAt: dateTimeFormatter.format(new Date(ticket.updated_at)),
      assignedTo: staff?.display_name ?? null,
      author: {
        id: ticket.authors.id,
        name: ticket.authors.name,
        email: ticket.authors.email,
        city: ticket.authors.city ?? "Not provided",
      },
      book: ticket.books ? {
        id: ticket.books.id,
        title: ticket.books.title,
        isbn: ticket.books.isbn,
        status: ticket.books.status,
        totalCopiesSold: ticket.books.total_copies_sold,
        royaltyPending: Number(ticket.books.royalty_pending),
        availableOn: ticket.books.available_on,
      } : null,
      ai: {
        state: ai?.state === "ready" ? "ready" : "manual_review",
        confidence: ai?.confidence ?? null,
        rationale: ai?.rationale ?? null,
        urgencySignals: ai?.urgency_signals ?? [],
        model: ai?.model ?? null,
      },
      draft: ai?.draft_body ? { subject: ai.draft_subject ?? ticket.subject, body: ai.draft_body, policyReferences: ai.policy_references } : null,
      messages: ticket.ticket_messages.map((message) => ({
        id: message.id,
        sender: message.sender,
        senderName: message.sender_name,
        body: message.body,
        createdAt: dateTimeFormatter.format(new Date(message.created_at)),
      })),
      internalNotes: ticket.internal_notes.map((note) => ({
        id: note.id,
        author: "BookLeaf Support",
        body: note.body,
        createdAt: dateTimeFormatter.format(new Date(note.created_at)),
      })),
      activity: [
        { id: `${ticket.id}-created`, label: "Ticket created", detail: `Submitted by ${ticket.authors.name}`, createdAt: dateTimeFormatter.format(new Date(ticket.created_at)) },
        ...(ai ? [{ id: ai.id, label: ai.state === "ready" ? "AI triage available" : "Manual review mode", detail: ai.rationale ?? "Provider unavailable; human workflow preserved", createdAt: dateTimeFormatter.format(new Date(ai.created_at)) }] : []),
      ],
    };
  });

  return { tickets };
});

export const getCurrentStaffProfile = cache(async () => {
  const { supabase, claims } = await requireRole(["admin", "ops"]);
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("display_name")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError("Unable to load the support profile.", "STAFF_PROFILE_QUERY_FAILED", { cause: error });
  }

  return data;
});

export async function getAdminTicketByCode(code: string) {
  const { tickets } = await getAdminPortalData();
  return tickets.find((ticket) => ticket.id === code);
}

export async function getAdminTicketDatabaseId(code: string) {
  const ticketNumber = z.string().regex(/^BL-\d+$/).transform((value) => Number(value.slice(3))).parse(code);
  const { supabase } = await requireClaims();
  const { data, error } = await supabase.from("tickets").select("id").eq("ticket_number", ticketNumber).single();
  if (error) throw new DatabaseOperationError("The support ticket could not be found.", "TICKET_NOT_FOUND", { cause: error });
  return data.id;
}

const ticketStatusSchema = z.enum(["Open", "In Progress", "Resolved", "Closed"]);

export async function listAdminTickets() {
  const { supabase } = await requireClaims();
  const { data, error } = await supabase
    .from("tickets")
    .select("*, authors(*), books(*), staff_profiles(*), ai_runs(*), ticket_messages(*), internal_notes(*)")
    .order("created_at", { ascending: true });
  if (error) throw new DatabaseOperationError("Unable to load the admin ticket queue.", "ADMIN_QUEUE_QUERY_FAILED", { cause: error });
  return data;
}

export async function updateAdminTicket(ticketId: string, input: unknown) {
  const id = z.string().uuid().parse(ticketId);
  const value = z.object({
    category: ticketCategorySchema.optional(),
    priority: ticketPrioritySchema.optional(),
    status: ticketStatusSchema.optional(),
    assignedTo: z.string().uuid().nullable().optional(),
  }).strict().parse(input);
  const { supabase } = await requireClaims();
  const { data, error } = await supabase
    .from("tickets")
    .update({ category: value.category, priority: value.priority, status: value.status, assigned_to: value.assignedTo })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new DatabaseOperationError("Unable to update the ticket.", "TICKET_UPDATE_FAILED", { cause: error });
  return data;
}

export async function addInternalNote(ticketId: string, body: string) {
  const id = z.string().uuid().parse(ticketId);
  const cleanBody = z.string().trim().min(1).max(4000).parse(body);
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("internal_notes")
    .insert({ ticket_id: id, author_user_id: claims.sub, body: cleanBody })
    .select("*")
    .single();
  if (error) throw new DatabaseOperationError("Unable to add the internal note.", "INTERNAL_NOTE_CREATE_FAILED", { cause: error });
  return data;
}

export async function addAdminReply(ticketId: string, body: string) {
  const id = z.string().uuid().parse(ticketId);
  const cleanBody = z.string().trim().min(1).max(4000).parse(body);
  const { supabase, claims } = await requireClaims();
  const { data: staff, error: staffError } = await supabase.from("staff_profiles").select("display_name").eq("user_id", claims.sub).single();
  if (staffError) throw new DatabaseOperationError("Unable to identify the support agent.", "STAFF_PROFILE_NOT_FOUND", { cause: staffError });
  const { data, error } = await supabase.from("ticket_messages").insert({ ticket_id: id, sender: "admin", sender_user_id: claims.sub, sender_name: staff.display_name, body: cleanBody }).select("*").single();
  if (error) throw new DatabaseOperationError("Unable to send the response.", "ADMIN_REPLY_CREATE_FAILED", { cause: error });
  await supabase.from("tickets").update({ status: "In Progress", assigned_to: claims.sub }).eq("id", id);
  return data;
}
