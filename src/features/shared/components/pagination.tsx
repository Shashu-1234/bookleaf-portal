import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { PaginationMeta } from "@/lib/pagination";

type PaginationProps = {
  meta: PaginationMeta;
  basePath: string;
  query?: Record<string, string | undefined>;
  pageParam?: string;
  itemLabel: string;
};

export function Pagination({ meta, basePath, query = {}, pageParam = "page", itemLabel }: PaginationProps) {
  const href = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set(pageParam, String(page));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <nav aria-label={`${itemLabel} pagination`} className="flex flex-col gap-3 border-t border-[#edf1f2] bg-[#fbfcfc] px-5 py-4 text-xs text-[#687f89] sm:flex-row sm:items-center sm:justify-between">
      <p><span className="font-bold text-[#29434f]">{meta.totalItems}</span> {itemLabel} · Page {meta.page} of {meta.totalPages}</p>
      <div className="flex items-center gap-2">
        {meta.page > 1 ? <Link aria-label={`Previous ${itemLabel} page`} href={href(meta.page - 1)} scroll={false} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#d8e2e5] bg-white px-3 font-semibold text-[#425c67] hover:border-[#9fc2cc] hover:text-[#176786]"><ChevronLeft className="size-4" />Previous</Link> : <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5eaec] bg-[#f3f5f6] px-3 font-semibold text-[#9aabb2]"><ChevronLeft className="size-4" />Previous</span>}
        {meta.page < meta.totalPages ? <Link aria-label={`Next ${itemLabel} page`} href={href(meta.page + 1)} scroll={false} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#d8e2e5] bg-white px-3 font-semibold text-[#425c67] hover:border-[#9fc2cc] hover:text-[#176786]">Next<ChevronRight className="size-4" /></Link> : <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5eaec] bg-[#f3f5f6] px-3 font-semibold text-[#9aabb2]">Next<ChevronRight className="size-4" /></span>}
      </div>
    </nav>
  );
}
