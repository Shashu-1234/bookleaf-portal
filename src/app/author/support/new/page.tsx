import type { Metadata } from "next";

import { NewQueryForm } from "@/features/author/components/new-query-form";
import { createAuthorTicket, getAuthorPortalData } from "@/lib/database/author-repository";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "New Support Query" };

export default async function NewAuthorQueryPage() {
  const { books } = await getAuthorPortalData();
  async function createTicketAction(formData: FormData) {
    "use server";
    const ticket = await createAuthorTicket({
      bookId: formData.get("bookId") === "account" ? null : String(formData.get("bookId") ?? ""),
      category: String(formData.get("category") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      description: String(formData.get("description") ?? ""),
    });
    redirect(`/author/support/${ticket.code}`);
  }
  return <NewQueryForm books={books} action={createTicketAction} />;
}
