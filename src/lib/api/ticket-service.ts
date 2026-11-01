import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";

import type { PortalRole } from "@/lib/database/auth";
import type { Database } from "@/lib/supabase/database.types";
import { ApiError, notFound } from "./errors";
import type { createMessageSchema, createNoteSchema, createTicketSchema, messageListQuerySchema, ticketListQuerySchema, updateTicketSchema } from "./schemas";

type Client = SupabaseClient<Database>;
type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
type MessageListQuery = z.infer<typeof messageListQuerySchema>;

function ticketNumber(code: string) {
  return Number(code.slice(3));
}

function range(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

function pageMeta(page: number, pageSize: number, count: number | null) {
  const totalItems = count ?? 0;
  return { page, pageSize, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / pageSize)) };
}

function databaseFailure(message: string, cause: unknown) {
  return new ApiError(500, "DATABASE_ERROR", message, undefined, { cause });
}

export async function listTickets(client: Client, input: TicketListQuery) {
  const bounds = range(input.page, input.pageSize);
  let query = client.from("tickets").select(`
    ticket_number, subject, description, category, priority, status, created_at, updated_at,
    authors(id, name), books(id, title, isbn), staff_profiles(display_name)
  `, { count: "exact" });

  if (input.status) query = query.eq("status", input.status);
  if (input.category) query = query.eq("category", input.category);
  if (input.priority) query = query.eq("priority", input.priority);
  if (input.createdAfter) query = query.gte("created_at", input.createdAfter);
  if (input.q) {
    const exact = /^BL-(\d+)$/i.exec(input.q);
    if (exact) query = query.eq("ticket_number", Number(exact[1]));
    else {
      const safe = input.q.replace(/[%_,()]/g, " ").trim();
      if (safe) query = query.or(`subject.ilike.%${safe}%,description.ilike.%${safe}%`);
    }
  }

  const { data, error, count } = await query
    .order("status", { ascending: true })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .order("ticket_number", { ascending: true })
    .range(bounds.from, bounds.to);
  if (error) throw databaseFailure("Unable to list tickets.", error);

  return {
    data: data.map((ticket) => ({
      id: `BL-${ticket.ticket_number}`,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      assignedTo: ticket.staff_profiles?.display_name ?? null,
      author: ticket.authors,
      book: ticket.books,
    })),
    meta: pageMeta(input.page, input.pageSize, count),
  };
}

export async function getTicket(client: Client, code: string) {
  const { data, error } = await client.from("tickets").select(`
    id, ticket_number, subject, description, category, priority, status, created_at, updated_at,
    authors(id, name, email, city), books(id, title, isbn, status), staff_profiles(display_name)
  `).eq("ticket_number", ticketNumber(code)).maybeSingle();
  if (error) throw databaseFailure("Unable to load the ticket.", error);
  if (!data) throw notFound("Ticket");
  return {
    internalId: data.id,
    data: {
      id: `BL-${data.ticket_number}`,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      assignedTo: data.staff_profiles?.display_name ?? null,
      author: data.authors,
      book: data.books,
    },
  };
}

export async function createTicket(client: Client, userId: string, input: z.infer<typeof createTicketSchema>) {
  const { data: author, error: authorError } = await client.from("authors").select("id").eq("user_id", userId).maybeSingle();
  if (authorError) throw databaseFailure("Unable to identify the author.", authorError);
  if (!author) throw new ApiError(403, "AUTHOR_PROFILE_REQUIRED", "The current account is not linked to an author profile.");

  if (input.bookId) {
    const { data: book, error: bookError } = await client.from("books").select("id").eq("id", input.bookId).eq("author_id", author.id).maybeSingle();
    if (bookError) throw databaseFailure("Unable to validate the selected book.", bookError);
    if (!book) throw new ApiError(422, "BOOK_NOT_ACCESSIBLE", "The selected book does not belong to the current author.");
  }

  const { data, error } = await client.from("tickets").insert({ author_id: author.id, book_id: input.bookId, subject: input.subject, description: input.description, category: "General Inquiry", priority: "Medium", status: "Open" }).select("id, ticket_number, created_at").single();
  if (error) throw databaseFailure("Unable to create the ticket.", error);
  return { internalId: data.id, data: { id: `BL-${data.ticket_number}`, status: "Open" as const, createdAt: data.created_at } };
}

export async function updateTicket(client: Client, code: string, userId: string, input: z.infer<typeof updateTicketSchema>) {
  const current = await getTicket(client, code);
  const assignedTo = input.assignedTo === "self" ? userId : input.assignedTo;
  const { data, error } = await client.from("tickets").update({ category: input.category, priority: input.priority, status: input.status, assigned_to: assignedTo }).eq("id", current.internalId).select("ticket_number, category, priority, status, updated_at, assigned_to").maybeSingle();
  if (error) throw databaseFailure("Unable to update the ticket.", error);
  if (!data) throw notFound("Ticket");
  return { id: `BL-${data.ticket_number}`, category: data.category, priority: data.priority, status: data.status, assignedToUserId: data.assigned_to, updatedAt: data.updated_at };
}

export async function listMessages(client: Client, code: string, input: MessageListQuery) {
  const ticket = await getTicket(client, code);
  const bounds = range(input.page, input.pageSize);
  const { data, error, count } = await client.from("ticket_messages").select("id, sender, sender_name, body, created_at", { count: "exact" }).eq("ticket_id", ticket.internalId).order("created_at", { ascending: false }).order("id", { ascending: false }).range(bounds.from, bounds.to);
  if (error) throw databaseFailure("Unable to list messages.", error);
  return {
    data: data.toReversed().map((message) => ({ id: message.id, sender: message.sender, senderName: message.sender_name, body: message.body, createdAt: message.created_at })),
    meta: pageMeta(input.page, input.pageSize, count),
  };
}

export async function createMessage(client: Client, code: string, userId: string, role: PortalRole, input: z.infer<typeof createMessageSchema>) {
  const ticket = await getTicket(client, code);
  const author = role === "author";
  const profile = author
    ? await client.from("authors").select("name").eq("user_id", userId).maybeSingle()
    : await client.from("staff_profiles").select("display_name").eq("user_id", userId).maybeSingle();
  if (profile.error) throw databaseFailure("Unable to identify the message sender.", profile.error);
  const senderName = author ? (profile.data as { name: string } | null)?.name : (profile.data as { display_name: string } | null)?.display_name;
  if (!senderName) throw new ApiError(403, "PROFILE_REQUIRED", "The current account does not have a sender profile.");

  const { data, error } = await client.from("ticket_messages").insert({ ticket_id: ticket.internalId, sender: author ? "author" : "admin", sender_user_id: userId, sender_name: senderName, body: input.body }).select("id, sender, sender_name, body, created_at").single();
  if (error) throw databaseFailure("Unable to create the message.", error);
  if (!author) await client.from("tickets").update({ status: "In Progress" }).eq("id", ticket.internalId).eq("status", "Open");
  return { id: data.id, sender: data.sender, senderName: data.sender_name, body: data.body, createdAt: data.created_at };
}

export async function createInternalNote(client: Client, code: string, userId: string, input: z.infer<typeof createNoteSchema>) {
  const ticket = await getTicket(client, code);
  const { data, error } = await client.from("internal_notes").insert({ ticket_id: ticket.internalId, author_user_id: userId, body: input.body }).select("id, body, created_at").single();
  if (error) throw databaseFailure("Unable to create the internal note.", error);
  return { id: data.id, body: data.body, createdAt: data.created_at };
}
