import type { TicketCategory } from "@/lib/ai/schemas";

export interface AuthorBook {
  id: string;
  title: string;
  isbn: string;
  genre: string;
  publicationDate: string;
  status: string;
  mrp: number;
  royaltyPerCopy: number;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  lastPayoutDate: string;
  printPartner: string;
  availableOn: string[];
}

export interface AuthorShellProfile {
  id: string;
  name: string;
  initials: string;
}

export type AuthorDashboardBook = Pick<
  AuthorBook,
  | "id"
  | "title"
  | "isbn"
  | "genre"
  | "status"
  | "totalCopiesSold"
  | "totalRoyaltyEarned"
  | "royaltyPending"
  | "availableOn"
>;

export type AuthorCatalogueBook = Omit<AuthorBook, "lastPayoutDate">;

export type AuthorRoyaltyBook = Pick<
  AuthorBook,
  "id" | "title" | "totalRoyaltyEarned" | "royaltyPaid" | "royaltyPending" | "lastPayoutDate"
>;

export type AuthorBookOption = Pick<AuthorBook, "id" | "title">;

export interface AuthorSupportTicket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  createdAt: string;
  updatedAt: string;
  bookId: string | null;
  messages: Array<{
    id: string;
    sender: "author" | "support";
    senderName: string;
    body: string;
    createdAt: string;
  }>;
}

export type AuthorSupportTicketSummary = Pick<
  AuthorSupportTicket,
  "id" | "subject" | "category" | "status" | "updatedAt" | "bookId"
> & { messageCount: number };

export type AuthorDashboardTicket = Pick<AuthorSupportTicket, "status">;

export interface RoyaltyPayout {
  id: string;
  period: string;
  date: string;
  amount: number;
  status: "Paid" | "Processing" | "Failed";
  reference: string;
}
