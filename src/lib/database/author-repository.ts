import "server-only";

import { after } from "next/server";
import { cache } from "react";
import { z } from "zod";

import type {
  AuthorBookOption,
  AuthorCatalogueBook,
  AuthorDashboardBook,
  AuthorDashboardTicket,
  AuthorRoyaltyBook,
  AuthorShellProfile,
  AuthorSupportTicket,
  AuthorSupportTicketSummary,
  RoyaltyPayout,
} from "@/features/author/types";

import { processNewTicketAi } from "./ai-repository";
import { requireClaims } from "./auth";
import { DatabaseOperationError } from "./errors";

export const createTicketInputSchema = z.object({
  bookId: z.string().regex(/^BK\d{3,}$/).nullable(),
  subject: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(4000),
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not available";
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function requireAuthorWorkspace<T>(data: T | null): T {
  if (!data) {
    throw new DatabaseOperationError(
      "The signed-in user is not linked to an author account.",
      "AUTHOR_LINK_NOT_FOUND",
    );
  }
  return data;
}

export const getAuthorShellProfile = cache(async (): Promise<AuthorShellProfile> => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select("id, name")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the author profile.",
      "AUTHOR_PROFILE_QUERY_FAILED",
      { cause: error },
    );
  }

  const author = requireAuthorWorkspace(data);
  return { id: author.id, name: author.name, initials: initials(author.name) };
});

export const getAuthorDashboardData = cache(async () => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select(`
      name,
      books(id, title, isbn, genre, status, total_copies_sold, total_royalty_earned, royalty_pending, available_on),
      tickets(status)
    `)
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the author dashboard.",
      "AUTHOR_DASHBOARD_QUERY_FAILED",
      { cause: error },
    );
  }

  const workspace = requireAuthorWorkspace(data);
  const books: AuthorDashboardBook[] = workspace.books.map((book) => ({
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    genre: book.genre,
    status: book.status,
    totalCopiesSold: book.total_copies_sold,
    totalRoyaltyEarned: Number(book.total_royalty_earned),
    royaltyPending: Number(book.royalty_pending),
    availableOn: book.available_on,
  }));
  const tickets: AuthorDashboardTicket[] = workspace.tickets.map((ticket) => ({
    status: ticket.status,
  }));

  return {
    author: { firstName: workspace.name.split(" ")[0] },
    books,
    tickets,
  };
});

export const getAuthorCatalogue = cache(async (): Promise<AuthorCatalogueBook[]> => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select(`
      books(
        id, title, isbn, genre, publication_date, status, mrp,
        author_royalty_per_copy, total_copies_sold, total_royalty_earned,
        royalty_paid, royalty_pending, print_partner, available_on
      )
    `)
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the author catalogue.",
      "AUTHOR_CATALOGUE_QUERY_FAILED",
      { cause: error },
    );
  }

  return requireAuthorWorkspace(data).books.map((book) => ({
    id: book.id,
    title: book.title,
    isbn: book.isbn,
    genre: book.genre,
    publicationDate: formatDate(book.publication_date),
    status: book.status,
    mrp: Number(book.mrp ?? 0),
    royaltyPerCopy: Number(book.author_royalty_per_copy ?? 0),
    totalCopiesSold: book.total_copies_sold,
    totalRoyaltyEarned: Number(book.total_royalty_earned),
    royaltyPaid: Number(book.royalty_paid),
    royaltyPending: Number(book.royalty_pending),
    printPartner: book.print_partner ?? "Not assigned",
    availableOn: book.available_on,
  }));
});

export const getAuthorRoyalties = cache(async () => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select(`
      books(id, title, total_royalty_earned, royalty_paid, royalty_pending, last_royalty_payout_date),
      royalty_payouts(id, period_start, period_end, paid_at, created_at, amount, status, reference)
    `)
    .eq("user_id", claims.sub)
    .order("created_at", { referencedTable: "royalty_payouts", ascending: false })
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load royalty data.",
      "AUTHOR_ROYALTIES_QUERY_FAILED",
      { cause: error },
    );
  }

  const workspace = requireAuthorWorkspace(data);
  const books: AuthorRoyaltyBook[] = workspace.books.map((book) => ({
    id: book.id,
    title: book.title,
    totalRoyaltyEarned: Number(book.total_royalty_earned),
    royaltyPaid: Number(book.royalty_paid),
    royaltyPending: Number(book.royalty_pending),
    lastPayoutDate: formatDate(book.last_royalty_payout_date),
  }));
  const payouts: RoyaltyPayout[] = workspace.royalty_payouts.map((payout) => ({
    id: payout.id,
    period: `${formatDate(payout.period_start)} – ${formatDate(payout.period_end)}`,
    date: formatDate(payout.paid_at ?? payout.created_at),
    amount: Number(payout.amount),
    status: payout.status,
    reference: payout.reference ?? "Pending reference",
  }));

  return { books, payouts };
});

export const getAuthorSupportData = cache(async () => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select(`
      books(id, title),
      tickets(ticket_number, subject, category, status, updated_at, book_id, ticket_messages(id))
    `)
    .eq("user_id", claims.sub)
    .order("updated_at", { referencedTable: "tickets", ascending: false })
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load support queries.",
      "AUTHOR_SUPPORT_QUERY_FAILED",
      { cause: error },
    );
  }

  const workspace = requireAuthorWorkspace(data);
  const books: AuthorBookOption[] = workspace.books.map((book) => ({
    id: book.id,
    title: book.title,
  }));
  const tickets: AuthorSupportTicketSummary[] = workspace.tickets.map((ticket) => ({
    id: `BL-${ticket.ticket_number}`,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    updatedAt: formatDateTime(ticket.updated_at),
    bookId: ticket.book_id,
    messageCount: ticket.ticket_messages.length,
  }));

  return { books, tickets };
});

export const getAuthorBookOptions = cache(async (): Promise<AuthorBookOption[]> => {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select("books(id, title)")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load book options.",
      "AUTHOR_BOOK_OPTIONS_QUERY_FAILED",
      { cause: error },
    );
  }

  return requireAuthorWorkspace(data).books.map((book) => ({
    id: book.id,
    title: book.title,
  }));
});

export async function getAuthorTicketByCode(code: string) {
  const ticketNumber = z
    .string()
    .regex(/^BL-\d+$/)
    .transform((value) => Number(value.slice(3)))
    .parse(code);
  const { supabase } = await requireClaims();
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      ticket_number, subject, description, category, status, created_at, updated_at, book_id,
      authors(name),
      books(id, title),
      ticket_messages(id, sender, sender_name, body, created_at)
    `)
    .eq("ticket_number", ticketNumber)
    .order("created_at", { referencedTable: "ticket_messages", ascending: true })
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the support ticket.",
      "AUTHOR_TICKET_QUERY_FAILED",
      { cause: error },
    );
  }
  if (!data) return null;

  const ticket: AuthorSupportTicket = {
    id: `BL-${data.ticket_number}`,
    subject: data.subject,
    description: data.description,
    category: data.category,
    status: data.status,
    createdAt: formatDateTime(data.created_at),
    updatedAt: formatDateTime(data.updated_at),
    bookId: data.book_id,
    messages: data.ticket_messages.map((message) => ({
      id: message.id,
      sender: message.sender === "admin" ? "support" : "author",
      senderName: message.sender_name,
      body: message.body,
      createdAt: formatDateTime(message.created_at),
    })),
  };

  return {
    ticket,
    book: data.books ? { id: data.books.id, title: data.books.title } : null,
    author: { name: data.authors.name, initials: initials(data.authors.name) },
  };
}

export async function createAuthorTicket(input: unknown) {
  const value = createTicketInputSchema.parse(input);
  const { supabase, claims } = await requireClaims();
  const { data: author, error: authorError } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", claims.sub)
    .single();

  if (authorError) {
    throw new DatabaseOperationError(
      "The signed-in user is not linked to an author account.",
      "AUTHOR_LINK_NOT_FOUND",
      { cause: authorError },
    );
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      author_id: author.id,
      book_id: value.bookId,
      category: "General Inquiry",
      subject: value.subject,
      description: value.description,
      priority: "Medium",
      status: "Open",
    })
    .select("id, ticket_number")
    .single();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to create the support ticket.",
      "TICKET_CREATE_FAILED",
      { cause: error },
    );
  }

  after(async () => {
    try {
      await processNewTicketAi(data.id);
    } catch (aiError) {
      console.error("[ticket-ai] Background processing failed", {
        ticketId: data.id,
        error: aiError instanceof Error ? aiError.message : "Unknown AI workflow error",
      });
    }
  });

  return { ...data, code: `BL-${data.ticket_number}` };
}

export async function addAuthorReply(ticketId: string, body: string) {
  const cleanBody = z.string().trim().min(1).max(4000).parse(body);
  const ticketNumber = z.string().regex(/^\d+$/).transform(Number).parse(ticketId);
  const { supabase, claims } = await requireClaims();
  const { data: author, error: authorError } = await supabase
    .from("authors")
    .select("name")
    .eq("user_id", claims.sub)
    .single();
  if (authorError) {
    throw new DatabaseOperationError(
      "The signed-in user is not linked to an author account.",
      "AUTHOR_LINK_NOT_FOUND",
      { cause: authorError },
    );
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("ticket_number", ticketNumber)
    .single();
  if (ticketError) {
    throw new DatabaseOperationError(
      "The support ticket could not be found.",
      "TICKET_NOT_FOUND",
      { cause: ticketError },
    );
  }

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender: "author",
    sender_user_id: claims.sub,
    sender_name: author.name,
    body: cleanBody,
  });
  if (error) {
    throw new DatabaseOperationError(
      "Unable to add the ticket reply.",
      "TICKET_REPLY_FAILED",
      { cause: error },
    );
  }
}
