import type { Metadata } from "next";

import { SupportCentre } from "@/features/author/components/support-centre";
import { getAuthorPortalData } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "Support" };

export default async function AuthorSupportPage() {
  const { tickets, books } = await getAuthorPortalData();
  return <SupportCentre tickets={tickets} books={books} />;
}
