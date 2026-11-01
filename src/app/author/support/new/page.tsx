import type { Metadata } from "next";

import { NewQueryForm } from "@/features/author/components/new-query-form";
import { getAuthorBookOptions } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "New Support Query" };

export default async function NewAuthorQueryPage() {
  const books = await getAuthorBookOptions();
  return <NewQueryForm books={books} />;
}
