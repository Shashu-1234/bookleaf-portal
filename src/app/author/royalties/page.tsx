import type { Metadata } from "next";

import { RoyaltiesOverview } from "@/features/author/components/royalties-overview";
import { getAuthorRoyalties } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "Royalties" };

export default async function AuthorRoyaltiesPage() {
  const { books, payouts } = await getAuthorRoyalties();
  return <RoyaltiesOverview books={books} payouts={payouts} />;
}
