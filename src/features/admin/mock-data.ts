import type { AdminTicket } from "./types";

export const currentAdmin = {
  name: "Aarav Mehta",
  role: "Support Operations",
  initials: "AM",
};

type DefaultedKey = "updatedAt" | "assignedTo" | "messages" | "internalNotes" | "activity";

const defaults: Pick<AdminTicket, DefaultedKey> = {
  updatedAt: "28 Oct 2026, 10:15",
  assignedTo: null,
  messages: [],
  internalNotes: [],
  activity: [],
};

const emptyAiAudit = {
  provider: null,
  inputTokens: null,
  outputTokens: null,
  latencyMs: null,
  errorCode: null,
};

function ticket(
  value: Omit<AdminTicket, DefaultedKey> & Partial<Pick<AdminTicket, DefaultedKey>>,
): AdminTicket {
  return { ...defaults, ...value };
}

export const adminTickets: AdminTicket[] = [
  ticket({
    id: "BL-1048",
    subject: "Royalty payment has been pending for six months",
    description:
      "My dashboard has shown a pending balance for months, but I have not received a transfer. My bank details are already linked. Please tell me what is happening.",
    category: "Royalty & Payments",
    aiCategory: "Royalty & Payments",
    priority: "Critical",
    aiPriority: "Critical",
    status: "Open",
    createdAt: "27 Oct 2026, 09:12",
    ageHours: 50,
    author: {
      id: "AUTH002",
      name: "Rohit Kapoor",
      email: "rohit.kapoor@email.com",
      city: "Delhi",
    },
    book: {
      id: "BK004",
      title: "Startup Sutra",
      isbn: "978-93-5XXXX-04-2",
      status: "Published & Live",
      totalCopiesSold: 1203,
      royaltyPending: 7744,
      availableOn: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.96,
      rationale:
        "The reported delay is far beyond the quarterly cycle and 45-day payout window, while bank details are already linked.",
      urgencySignals: ["six-month delay", "₹7,744 pending", "bank details linked"],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: {
      subject: "Update on your pending royalty payment",
      body:
        "Hi Rohit,\n\nI understand how concerning it is to see your royalty balance remain pending for this long, especially when your bank details are already linked. BookLeaf calculates royalties quarterly and normally completes payment within 45 days after the quarter ends. Based on the delay you described, this requires an immediate review rather than a routine payout update.\n\nI am escalating the payment record for Startup Sutra to our royalty team so they can verify the applicable quarter, payout status, and bank-transfer record. We will share a confirmed update with you within 48 hours.\n\nOur next step is to verify the transaction history and confirm the resolution timeline with you.",
      policyReferences: ["Royalty policy", "Communication tone", "Accuracy guardrail"],
    },
    messages: [
      {
        id: "MSG-1",
        sender: "author",
        senderName: "Rohit Kapoor",
        body:
          "My dashboard has shown a pending balance for months, but I have not received a transfer. My bank details are already linked. Please tell me what is happening.",
        createdAt: "27 Oct 2026, 09:12",
      },
    ],
    activity: [
      {
        id: "ACT-1",
        label: "Ticket created",
        detail: "Submitted by Rohit Kapoor",
        createdAt: "27 Oct 2026, 09:12",
      },
      {
        id: "ACT-2",
        label: "AI triage completed",
        detail: "Royalty & Payments · Critical · 96% confidence",
        createdAt: "27 Oct 2026, 09:13",
      },
    ],
  }),
  ticket({
    id: "BL-1047",
    subject: "Amazon is showing the wrong ISBN",
    description:
      "The ISBN displayed on Amazon is different from the ISBN printed inside my book. Please correct it urgently.",
    category: "ISBN & Metadata Issues",
    aiCategory: "ISBN & Metadata Issues",
    priority: "High",
    aiPriority: "High",
    status: "In Progress",
    createdAt: "27 Oct 2026, 11:40",
    ageHours: 47,
    assignedTo: "Aarav Mehta",
    author: {
      id: "AUTH010",
      name: "Diya Chatterjee",
      email: "diya.chatterjee@email.com",
      city: "Kolkata",
    },
    book: {
      id: "BK017",
      title: "Durga’s Daughters",
      isbn: "978-93-5XXXX-17-2",
      status: "Published & Live",
      totalCopiesSold: 612,
      royaltyPending: 2540,
      availableOn: ["Amazon India", "Flipkart", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.99,
      rationale:
        "A mismatch between the physical book and marketplace ISBN is explicitly a high-priority production data issue.",
      urgencySignals: ["ISBN mismatch", "live marketplace metadata"],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: {
      subject: "Urgent review of the ISBN shown on Amazon",
      body:
        "Hi Diya,\n\nThank you for flagging this. An ISBN mismatch between the physical book and its Amazon listing is a serious metadata issue, and I’m sorry this has occurred.\n\nWe are escalating the listing for verification against the registered BookLeaf ISBN. We will update you within 48 hours with the correction status and any action required from you.\n\nOur next step is to compare the marketplace record with the ISBN printed in your book and initiate the correction.",
      policyReferences: ["ISBN policy", "Communication tone"],
    },
    internalNotes: [
      {
        id: "NOTE-1",
        author: "Aarav Mehta",
        body: "Production verification requested; awaiting marketplace screenshot.",
        createdAt: "28 Oct 2026, 10:15",
      },
    ],
  }),
  ticket({
    id: "BL-1044",
    subject: "Author copies have blurry images and loose binding",
    description:
      "The images are blurry and two copies have loose binding. I can send photographs. What should I do next?",
    category: "Printing & Quality",
    aiCategory: "Printing & Quality",
    priority: "High",
    aiPriority: "High",
    status: "Open",
    createdAt: "26 Oct 2026, 14:05",
    ageHours: 69,
    author: { id: "AUTH005", name: "Meera Nair", email: "meera.nair@email.com", city: "Kochi" },
    book: {
      id: "BK008",
      title: "Cardamom & Chaos",
      isbn: "978-93-5XXXX-08-0",
      status: "Published & Live",
      totalCopiesSold: 445,
      royaltyPending: 0,
      availableOn: ["Amazon India", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.98,
      rationale: "The author describes two specific manufacturing defects and offers evidence.",
      urgencySignals: ["multiple defective copies", "binding defect", "image quality"],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: null,
  }),
  ticket({
    id: "BL-1042",
    subject: "Book unavailable on Amazon India",
    description: "My book was live last week, but it now says Currently Unavailable on Amazon India.",
    category: "Distribution & Availability",
    aiCategory: "Distribution & Availability",
    priority: "Medium",
    aiPriority: "Medium",
    status: "In Progress",
    createdAt: "27 Oct 2026, 16:20",
    ageHours: 42,
    assignedTo: "Aarav Mehta",
    author: { id: "AUTH004", name: "Vikram Joshi", email: "vikram.joshi@email.com", city: "Pune" },
    book: {
      id: "BK006",
      title: "Debugging Life",
      isbn: "978-93-5XXXX-06-6",
      status: "Published & Live",
      totalCopiesSold: 534,
      royaltyPending: 3350,
      availableOn: ["Amazon India", "Flipkart", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.95,
      rationale: "A previously live listing becoming unavailable usually indicates a stock-sync issue.",
      urgencySignals: ["previously live listing", "Amazon unavailable"],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: null,
  }),
  ticket({
    id: "BL-1039",
    subject: "Still waiting in typesetting after three weeks",
    description:
      "Raising Roots has been in typesetting for three weeks. Can you tell me when I will receive the proof?",
    category: "Book Status & Production Updates",
    aiCategory: null,
    priority: "Medium",
    aiPriority: null,
    status: "Open",
    createdAt: "26 Oct 2026, 08:35",
    ageHours: 75,
    author: {
      id: "AUTH009",
      name: "Kavita Deshmukh",
      email: "kavita.deshmukh@email.com",
      city: "Nagpur",
    },
    book: {
      id: "BK015",
      title: "Raising Roots",
      isbn: "978-93-5XXXX-15-8",
      status: "In Production - Typesetting",
      totalCopiesSold: 0,
      royaltyPending: 0,
      availableOn: [],
    },
    ai: {
      ...emptyAiAudit,
      state: "manual_review",
      confidence: null,
      rationale: null,
      urgencySignals: [],
      model: null,
    },
    draft: null,
    activity: [
      {
        id: "ACT-4",
        label: "AI unavailable",
        detail: "Ticket created successfully and routed for manual triage",
        createdAt: "26 Oct 2026, 08:36",
      },
    ],
  }),
  ticket({
    id: "BL-1036",
    subject: "Can I update my Amazon book description?",
    description: "I want to replace two paragraphs after publication. Is that possible?",
    category: "General Inquiry",
    aiCategory: "General Inquiry",
    priority: "Low",
    aiPriority: "Low",
    status: "Resolved",
    createdAt: "25 Oct 2026, 12:10",
    ageHours: 96,
    assignedTo: "Aarav Mehta",
    author: { id: "AUTH001", name: "Priya Sharma", email: "priya.sharma@email.com", city: "Mumbai" },
    book: {
      id: "BK001",
      title: "Whispers of the Ganges",
      isbn: "978-93-5XXXX-01-1",
      status: "Published & Live",
      totalCopiesSold: 342,
      royaltyPending: 3570,
      availableOn: ["Amazon India", "Flipkart", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.92,
      rationale: "The request is a routine post-publication metadata update.",
      urgencySignals: [],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: null,
  }),
  ticket({
    id: "BL-1031",
    subject: "Royalty amount seems lower than expected",
    description: "I sold many copies but the royalty total is lower than expected. Can I see the calculation?",
    category: "Royalty & Payments",
    aiCategory: "Royalty & Payments",
    priority: "Medium",
    aiPriority: "Medium",
    status: "Closed",
    createdAt: "23 Oct 2026, 13:45",
    ageHours: 142,
    assignedTo: "Aarav Mehta",
    author: {
      id: "AUTH007",
      name: "Sneha Kulkarni",
      email: "sneha.kulkarni@email.com",
      city: "Bengaluru",
    },
    book: {
      id: "BK011",
      title: "The Algorithm of Love",
      isbn: "978-93-5XXXX-11-0",
      status: "Published & Live",
      totalCopiesSold: 1567,
      royaltyPending: 4175,
      availableOn: ["Amazon India", "Flipkart", "Amazon US", "BookLeaf Store"],
    },
    ai: {
      ...emptyAiAudit,
      state: "ready",
      confidence: 0.97,
      rationale: "The author requests transparency about royalty calculation rather than a missing payout.",
      urgencySignals: [],
      model: "Gemini 2.5 Flash-Lite",
    },
    draft: null,
  }),
];

export function getAdminTicket(ticketId: string): AdminTicket | undefined {
  return adminTickets.find((entry) => entry.id === ticketId);
}
