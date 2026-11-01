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
import { MESSAGES_PAGE_SIZE, pageRange, paginationMeta, TICKETS_PAGE_SIZE } from "@/lib/pagination";

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

const supportPageInputSchema = z.object({
  page: z.number().int().positive().max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
});

export const getAuthorSupportData = cache(async (input: unknown) => {
  const filters = supportPageInputSchema.parse(input);
  const { supabase, claims } = await requireClaims();
  const { data: authorData, error: authorError } = await supabase
    .from("authors")
    .select("id, books(id, title)")
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (authorError) {
    throw new DatabaseOperationError(
      "Unable to load support queries.",
      "AUTHOR_SUPPORT_QUERY_FAILED",
      { cause: authorError },
    );
  }

  const workspace = requireAuthorWorkspace(authorData);
  const { from, to } = pageRange(filters.page, TICKETS_PAGE_SIZE);
  let ticketsQuery = supabase
    .from("tickets")
    .select("ticket_number, subject, category, status, updated_at, book_id, ticket_messages(count)", { count: "exact" })
    .eq("author_id", workspace.id);
  if (filters.search) {
    const ticketMatch = /^BL-(\d+)$/i.exec(filters.search);
    if (ticketMatch) ticketsQuery = ticketsQuery.eq("ticket_number", Number(ticketMatch[1]));
    else {
      const safeSearch = filters.search.replace(/[%_,()]/g, " ").trim();
      if (safeSearch) ticketsQuery = ticketsQuery.ilike("subject", `%${safeSearch}%`);
    }
  }

  const [ticketResult, openResult, resolvedResult] = await Promise.all([
    ticketsQuery.order("updated_at", { ascending: false }).order("ticket_number", { ascending: false }).range(from, to),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("author_id", workspace.id).in("status", ["Open", "In Progress"]),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("author_id", workspace.id).in("status", ["Resolved", "Closed"]),
  ]);
  if (ticketResult.error || openResult.error || resolvedResult.error) {
    throw new DatabaseOperationError("Unable to load support queries.", "AUTHOR_SUPPORT_QUERY_FAILED", { cause: ticketResult.error ?? openResult.error ?? resolvedResult.error });
  }

  const books: AuthorBookOption[] = workspace.books.map((book) => ({
    id: book.id,
    title: book.title,
  }));
  const tickets: AuthorSupportTicketSummary[] = ticketResult.data.map((ticket) => ({
    id: `BL-${ticket.ticket_number}`,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    updatedAt: formatDateTime(ticket.updated_at),
    bookId: ticket.book_id,
    messageCount: ticket.ticket_messages[0]?.count ?? 0,
  }));

  return {
    books,
    tickets,
    search: filters.search,
    stats: { open: openResult.count ?? 0, resolved: resolvedResult.count ?? 0 },
    pagination: paginationMeta(filters.page, TICKETS_PAGE_SIZE, ticketResult.count),
  };
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

export async function getAuthorTicketByCode(code: string, messagePage = 1) {
  const ticketNumber = z
    .string()
    .regex(/^BL-\d+$/)
    .transform((value) => Number(value.slice(3)))
    .parse(code);
  const { supabase } = await requireClaims();
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      id, ticket_number, subject, description, category, status, created_at, updated_at, book_id,
      authors(name),
      books(id, title)
    `)
    .eq("ticket_number", ticketNumber)
    .maybeSingle();

  if (error) {
    throw new DatabaseOperationError(
      "Unable to load the support ticket.",
      "AUTHOR_TICKET_QUERY_FAILED",
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
    throw new DatabaseOperationError("Unable to load the ticket conversation.", "AUTHOR_MESSAGES_QUERY_FAILED", { cause: messageError });
  }

  const ticket: AuthorSupportTicket = {
    id: `BL-${data.ticket_number}`,
    subject: data.subject,
    description: data.description,
    category: data.category,
    status: data.status,
    createdAt: formatDateTime(data.created_at),
    updatedAt: formatDateTime(data.updated_at),
    bookId: data.book_id,
    messages: messageRows.toReversed().map((message) => ({
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
    messagePagination: paginationMeta(messagePage, MESSAGES_PAGE_SIZE, messageCount),
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
