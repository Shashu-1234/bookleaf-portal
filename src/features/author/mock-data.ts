import type { AuthorBook, AuthorSupportTicket, RoyaltyPayout } from "./types";

export const currentAuthor = {
  id: "AUTH002",
  name: "Rohit Kapoor",
  firstName: "Rohit",
  email: "rohit.kapoor@email.com",
  phone: "+91-87654-32109",
  city: "Delhi",
  joinedDate: "8 Nov 2022",
  initials: "RK",
};

export const authorBooks: AuthorBook[] = [
  {
    id: "BK003",
    title: "Code & Karma",
    isbn: "978-93-5XXXX-03-5",
    genre: "Self-Help / Technology",
    publicationDate: "14 Feb 2023",
    status: "Published & Live",
    mrp: 350,
    royaltyPerCopy: 30,
    totalCopiesSold: 876,
    totalRoyaltyEarned: 26280,
    royaltyPaid: 21000,
    royaltyPending: 5280,
    lastPayoutDate: "1 Sep 2025",
    printPartner: "Repro India",
    availableOn: ["Amazon India", "Flipkart", "Amazon US", "BookLeaf Store"],
  },
  {
    id: "BK004",
    title: "Startup Sutra",
    isbn: "978-93-5XXXX-04-2",
    genre: "Business / Entrepreneurship",
    publicationDate: "22 May 2024",
    status: "Published & Live",
    mrp: 499,
    royaltyPerCopy: 48,
    totalCopiesSold: 1203,
    totalRoyaltyEarned: 57744,
    royaltyPaid: 50000,
    royaltyPending: 7744,
    lastPayoutDate: "15 Nov 2025",
    printPartner: "In-House",
    availableOn: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
  },
];

export const authorTickets: AuthorSupportTicket[] = [
  {
    id: "BL-1048",
    subject: "Royalty payment has been pending for six months",
    description:
      "My dashboard has shown a pending balance for months, but I have not received a transfer. My bank details are already linked. Please tell me what is happening.",
    category: "Royalty & Payments",
    status: "Open",
    createdAt: "27 Oct 2026, 09:12",
    updatedAt: "27 Oct 2026, 09:13",
    bookId: "BK004",
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
  },
  {
    id: "BL-1016",
    subject: "Add Amazon UK availability for Code & Karma",
    description: "Can my book also be made available through Amazon UK?",
    category: "Distribution & Availability",
    status: "Resolved",
    createdAt: "18 Oct 2026, 14:22",
    updatedAt: "20 Oct 2026, 11:05",
    bookId: "BK003",
    messages: [
      {
        id: "MSG-2",
        sender: "author",
        senderName: "Rohit Kapoor",
        body: "Can my book also be made available through Amazon UK?",
        createdAt: "18 Oct 2026, 14:22",
      },
      {
        id: "MSG-3",
        sender: "support",
        senderName: "Aarav · BookLeaf Support",
        body:
          "Hi Rohit, we have submitted Code & Karma for Amazon UK distribution. Marketplace listings usually become visible within 7–10 business days. We will continue monitoring the listing and let you know if any additional metadata is required.",
        createdAt: "20 Oct 2026, 11:05",
      },
    ],
  },
];

export const royaltyPayouts: RoyaltyPayout[] = [
  { id: "PAY-2025-Q3", period: "Jul–Sep 2025", date: "15 Nov 2025", amount: 12500, status: "Paid", reference: "BLR-251115-8821" },
  { id: "PAY-2025-Q2", period: "Apr–Jun 2025", date: "1 Sep 2025", amount: 9000, status: "Paid", reference: "BLR-250901-6402" },
  { id: "PAY-2025-Q1", period: "Jan–Mar 2025", date: "20 Jun 2025", amount: 11000, status: "Paid", reference: "BLR-250620-5198" },
];

export function getAuthorBook(bookId: string) {
  return authorBooks.find((book) => book.id === bookId);
}

export function getAuthorTicket(ticketId: string) {
  return authorTickets.find((ticket) => ticket.id === ticketId);
}
