import type { Metadata } from "next";

import { BooksOverview } from "@/features/author/components/books-overview";
import { getAuthorCatalogue } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "My Books" };

export default async function AuthorBooksPage() {
  const books = await getAuthorCatalogue();
  return <BooksOverview books={books} />;
}
