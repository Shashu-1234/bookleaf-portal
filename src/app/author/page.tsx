import { AuthorDashboard } from "@/features/author/components/author-dashboard";
import { getAuthorDashboardData } from "@/lib/database/author-repository";

export default async function AuthorDashboardPage() {
  const { author, books, tickets } = await getAuthorDashboardData();
  return <AuthorDashboard author={author} books={books} tickets={tickets} />;
}
