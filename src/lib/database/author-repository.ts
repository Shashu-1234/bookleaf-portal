import "server-only";

import { cache } from "react";
import { z } from "zod";

import { ticketCategorySchema } from "@/lib/ai/schemas";

import { requireClaims } from "./auth";
import { DatabaseOperationError } from "./errors";
import type { AuthorBook, AuthorSupportTicket, RoyaltyPayout } from "@/features/author/types";

export const createTicketInputSchema = z.object({
  bookId: z.string().regex(/^BK\d{3,}$/).nullable(),
  category: ticketCategorySchema,
  subject: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(4000),
});

export async function getCurrentAuthorWorkspace() {
  const { supabase, claims } = await requireClaims();
  const { data, error } = await supabase
    .from("authors")
    .select("*, books(*), royalty_payouts(*), tickets(*, ticket_messages(*))")
    .eq("user_id", claims.sub)
    .order("created_at", { referencedTable: "tickets", ascending: false })
    .maybeSingle();

  if (error) throw new DatabaseOperationError("Unable to load the author workspace.", "AUTHOR_WORKSPACE_QUERY_FAILED", { cause: error });
  return data;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Not available";
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export const getAuthorPortalData = cache(async () => {
  const workspace = await getCurrentAuthorWorkspace();
  if (!workspace) throw new DatabaseOperationError("The signed-in user is not linked to an author account.", "AUTHOR_LINK_NOT_FOUND");

  const books: AuthorBook[] = workspace.books.map((book) => ({
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
    lastPayoutDate: formatDate(book.last_royalty_payout_date),
    printPartner: book.print_partner ?? "Not assigned",
    availableOn: book.available_on,
  }));

  const tickets: AuthorSupportTicket[] = workspace.tickets.map((ticket) => ({
    id: `BL-${ticket.ticket_number}`,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    createdAt: formatDateTime(ticket.created_at),
    updatedAt: formatDateTime(ticket.updated_at),
    bookId: ticket.book_id,
    messages: ticket.ticket_messages.map((message) => ({
      id: message.id,
      sender: message.sender === "admin" ? "support" : "author",
      senderName: message.sender_name,
      body: message.body,
      createdAt: formatDateTime(message.created_at),
    })),
  }));

  const payouts: RoyaltyPayout[] = workspace.royalty_payouts.map((payout) => ({
    id: payout.id,
    period: `${formatDate(payout.period_start)} – ${formatDate(payout.period_end)}`,
    date: formatDate(payout.paid_at ?? payout.created_at),
    amount: Number(payout.amount),
    status: payout.status,
    reference: payout.reference ?? "Pending reference",
  }));

  return {
    author: {
      id: workspace.id,
      name: workspace.name,
      firstName: workspace.name.split(" ")[0],
      email: workspace.email,
      phone: workspace.phone ?? "Not provided",
      city: workspace.city ?? "Not provided",
      joinedDate: formatDate(workspace.joined_date),
      initials: workspace.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    },
    books,
    tickets,
    payouts,
  };
});

export async function createAuthorTicket(input: unknown) {
  const value = createTicketInputSchema.parse(input);
  const { supabase, claims } = await requireClaims();
  const { data: author, error: authorError } = await supabase
    .from("authors")
    .select("id")
    .eq("user_id", claims.sub)
    .single();

  if (authorError) throw new DatabaseOperationError("The signed-in user is not linked to an author account.", "AUTHOR_LINK_NOT_FOUND", { cause: authorError });

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      author_id: author.id,
      book_id: value.bookId,
      category: value.category,
      subject: value.subject,
      description: value.description,
      priority: "Medium",
      status: "Open",
    })
    .select("id, ticket_number, created_at")
    .single();

  if (error) throw new DatabaseOperationError("Unable to create the support ticket.", "TICKET_CREATE_FAILED", { cause: error });
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
  if (authorError) throw new DatabaseOperationError("The signed-in user is not linked to an author account.", "AUTHOR_LINK_NOT_FOUND", { cause: authorError });

  const { data: ticket, error: ticketError } = await supabase.from("tickets").select("id").eq("ticket_number", ticketNumber).single();
  if (ticketError) throw new DatabaseOperationError("The support ticket could not be found.", "TICKET_NOT_FOUND", { cause: ticketError });

  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: ticket.id, sender: "author", sender_user_id: claims.sub, sender_name: author.name, body: cleanBody })
    .select("*")
    .single();
  if (error) throw new DatabaseOperationError("Unable to add the ticket reply.", "TICKET_REPLY_FAILED", { cause: error });
  return data;
}
