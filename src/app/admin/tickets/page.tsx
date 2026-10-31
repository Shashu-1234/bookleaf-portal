import type { Metadata } from "next";

import { TicketQueue } from "@/features/admin/components/ticket-queue";
import { getAdminTicketQueue } from "@/lib/database/admin-repository";

export const metadata: Metadata = { title: "Ticket Queue" };

export default async function TicketQueuePage() {
  const tickets = await getAdminTicketQueue();
  return <TicketQueue tickets={tickets} />;
}
