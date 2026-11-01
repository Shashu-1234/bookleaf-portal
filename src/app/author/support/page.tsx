import type { Metadata } from "next";

import { SupportCentre } from "@/features/author/components/support-centre";
import { getAuthorSupportData } from "@/lib/database/author-repository";
import { parsePage } from "@/lib/pagination";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Support" };

export default async function AuthorSupportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = Array.isArray(params.q) ? params.q[0] : params.q;
  const result = await getAuthorSupportData({ page: parsePage(params.page), search });
  if (result.pagination.page > result.pagination.totalPages) {
    const next = new URLSearchParams();
    if (result.search) next.set("q", result.search);
    if (result.pagination.totalPages > 1) next.set("page", String(result.pagination.totalPages));
    redirect(`/author/support${next.size ? `?${next}` : ""}`);
  }
  return <SupportCentre {...result} />;
}
