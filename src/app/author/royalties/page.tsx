import type { Metadata } from "next";

import { RoyaltiesOverview } from "@/features/author/components/royalties-overview";
import { getAuthorPortalData } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "Royalties" };

export default async function AuthorRoyaltiesPage() {
  const { books, payouts } = await getAuthorPortalData();
  return <RoyaltiesOverview books={books} payouts={payouts} />;
}
