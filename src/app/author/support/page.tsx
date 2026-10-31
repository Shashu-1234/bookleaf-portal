import type { Metadata } from "next";

import { SupportCentre } from "@/features/author/components/support-centre";
import { getAuthorSupportData } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "Support" };

export default async function AuthorSupportPage() {
  const { tickets, books } = await getAuthorSupportData();
  return <SupportCentre tickets={tickets} books={books} />;
}
