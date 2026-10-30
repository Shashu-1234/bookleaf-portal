import type { TicketCategory } from "./schemas";
import type { KnowledgeSection } from "./types";

const sharedSections: KnowledgeSection[] = [
  {
    label: "Company overview",
    content:
      "BookLeaf Publishing is a self-publishing company operating in India and the US. It offers Standard Free and Bestseller Breakthrough packages and handles cover design, typesetting, ISBN assignment, printing, distribution, and royalty management.",
  },
  {
    label: "Communication tone",
    content:
      "Treat authors as partners. Acknowledge the concern before giving a solution. Be empathetic, professional, and specific. Own BookLeaf mistakes directly. If investigation is needed, provide a clear supported timeline. End with a concrete next step.",
  },
  {
    label: "Accuracy guardrail",
    content:
      "Use only supplied account, book, ticket, and policy facts. Never invent sales breakdowns, payout dates, production progress, investigation results, or actions that have not occurred. Ask for missing information or state that the team must verify it.",
  },
];

const categorySections: Record<TicketCategory, KnowledgeSection[]> = {
  "Royalty & Payments": [
    {
      label: "Royalty policy",
      category: "Royalty & Payments",
      content:
        "Authors receive 80% of net profit and BookLeaf receives 20%. Net profit is MRP minus printing cost, platform commission, and shipping. Royalties are calculated quarterly and paid within 45 days after the quarter ends. The minimum payout is ₹1,000; lower balances roll into the next quarter. Payments use the bank account linked in the author dashboard. Offer a detailed breakdown when an amount is questioned.",
    },
  ],
  "ISBN & Metadata Issues": [
    {
      label: "ISBN policy",
      category: "ISBN & Metadata Issues",
      content:
        "Every BookLeaf-published book receives a unique ISBN registered under BookLeaf's publisher imprint. Authors wanting their own imprint must obtain an ISBN independently. A duplicate ISBN or an ISBN linked to the wrong book is high priority and must be escalated to production with a 48-hour resolution timeline.",
    },
    {
      label: "Metadata update policy",
      category: "ISBN & Metadata Issues",
      content:
        "Metadata updates may be submitted through the dashboard or by emailing the BookLeaf team. Platform changes typically appear within 3–5 business days.",
    },
  ],
  "Printing & Quality": [
    {
      label: "Printing and quality policy",
      category: "Printing & Quality",
      content:
        "Most orders are printed in-house in Delhi; overflow or special formats may use Repro India or Epitome Books. Standard turnaround is 5–7 business days after order confirmation. For verified misprints, binding defects, or color inconsistency, BookLeaf arranges a free reprint. Ask for photos of defective copies when needed.",
    },
  ],
  "Distribution & Availability": [
    {
      label: "Distribution policy",
      category: "Distribution & Availability",
      content:
        "Books may be listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store. New listings typically go live 7–10 business days after publication is complete. An unavailable listing usually indicates a stock-sync issue; the team can trigger a re-sync with an expected 24–48 hour resolution window.",
    },
  ],
  "Book Status & Production Updates": [
    {
      label: "Production stages",
      category: "Book Status & Production Updates",
      content:
        "Stages are Manuscript Received, Editing (if opted), Cover Design, Typesetting, Proofreading, ISBN Assignment, Printing, Distribution Setup, and Published & Live. Authors receive email updates. Delays commonly occur during cover approval and proofreading revisions. Check the actual status and give a specific verified timeline without blaming the author.",
    },
  ],
  "General Inquiry": [
    {
      label: "General support policy",
      category: "General Inquiry",
      content:
        "Answer only from the supplied BookLeaf policies and account context. If no policy covers the request, acknowledge it and route the question to the appropriate team rather than guessing.",
    },
  ],
};

export function getKnowledgeSections(category: TicketCategory): KnowledgeSection[] {
  return [...sharedSections, ...categorySections[category]];
}

export function formatKnowledgeSections(sections: KnowledgeSection[]): string {
  return sections.map((section) => `### ${section.label}\n${section.content}`).join("\n\n");
}
