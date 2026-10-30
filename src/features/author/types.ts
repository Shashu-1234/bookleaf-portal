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

export interface RoyaltyPayout {
  id: string;
  period: string;
  date: string;
  amount: number;
  status: "Paid" | "Processing" | "Failed";
  reference: string;
}
