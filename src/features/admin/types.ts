import type { TicketCategory, TicketPriority } from "@/lib/ai/schemas";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface AdminTicket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  aiCategory: TicketCategory | null;
  priority: TicketPriority;
  aiPriority: TicketPriority | null;
  status: TicketStatus;
  createdAt: string;
  ageHours: number;
  updatedAt: string;
  assignedTo: string | null;
  author: { id: string; name: string; email: string; city: string };
  book: {
    id: string;
    title: string;
    isbn: string;
    status: string;
    totalCopiesSold: number;
    royaltyPending: number;
    availableOn: string[];
  } | null;
  ai: {
    state: "ready" | "manual_review";
    confidence: number | null;
    rationale: string | null;
    urgencySignals: string[];
    model: string | null;
  };
  draft: { subject: string; body: string; policyReferences: string[] } | null;
  messages: Array<{
    id: string;
    sender: "author" | "admin";
    senderName: string;
    body: string;
    createdAt: string;
  }>;
  internalNotes: Array<{ id: string; author: string; body: string; createdAt: string }>;
  activity: Array<{ id: string; label: string; detail: string; createdAt: string }>;
}
