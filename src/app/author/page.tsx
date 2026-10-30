import { AuthorDashboard } from "@/features/author/components/author-dashboard";
import { getAuthorPortalData } from "@/lib/database/author-repository";

export default async function AuthorDashboardPage() {
  const { author, books, tickets } = await getAuthorPortalData();
  return <AuthorDashboard author={author} books={books} tickets={tickets} />;
}
