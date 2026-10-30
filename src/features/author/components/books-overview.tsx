import { BookOpen, CalendarDays, CheckCircle2, ExternalLink, PackageCheck, Store } from "lucide-react";

import { currency, number } from "../formatters";
import type { AuthorBook } from "../types";

export function BooksOverview({ books }: { books: AuthorBook[] }) {
  return (
    <div className="space-y-6">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">Publishing catalogue</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">My books</h1><p className="mt-2 text-sm leading-6 text-[#687f89]">Publication status, marketplace availability and performance for every title.</p></div>

      <div className="grid gap-5 2xl:grid-cols-2">
        {books.map((book) => (
          <article key={book.id} className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <div className="border-b border-[#e7edef] bg-gradient-to-br from-[#f4fafb] to-white p-5 sm:p-6">
              <div className="flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#176786] text-white shadow-sm"><BookOpen className="size-6" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-[#172b36]">{book.title}</h2><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><CheckCircle2 className="size-3" />{book.status}</span></div><p className="mt-1 text-sm text-[#687f89]">{book.genre}</p><p className="mt-2 font-mono text-xs text-[#78909b]">ISBN {book.isbn}</p></div></div>
            </div>
            <div className="p-5 sm:p-6">
              <dl className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
                <div><dt className="text-xs text-[#78909b]">Copies sold</dt><dd className="mt-1 text-lg font-bold text-[#243e49]">{number.format(book.totalCopiesSold)}</dd></div>
                <div><dt className="text-xs text-[#78909b]">MRP</dt><dd className="mt-1 text-lg font-bold text-[#243e49]">{currency.format(book.mrp)}</dd></div>
                <div><dt className="text-xs text-[#78909b]">Royalty / copy</dt><dd className="mt-1 text-lg font-bold text-[#243e49]">{currency.format(book.royaltyPerCopy)}</dd></div>
                <div><dt className="text-xs text-[#78909b]">Total earned</dt><dd className="mt-1 text-lg font-bold text-emerald-700">{currency.format(book.totalRoyaltyEarned)}</dd></div>
              </dl>
              <div className="mt-6 grid gap-3 border-t border-[#edf1f2] pt-5 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-xs text-[#5f7680]"><CalendarDays className="size-4 text-[#176786]" />Published {book.publicationDate}</div>
                <div className="flex items-center gap-2 text-xs text-[#5f7680]"><PackageCheck className="size-4 text-[#176786]" />Printed by {book.printPartner}</div>
                <div className="flex items-center gap-2 text-xs text-[#5f7680]"><Store className="size-4 text-[#176786]" />{book.availableOn.length} marketplaces</div>
              </div>
              <div className="mt-5 rounded-xl bg-[#f7fafb] p-4"><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#687f89]">Available on</p><div className="flex flex-wrap gap-2">{book.availableOn.map((marketplace) => <span key={marketplace} className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe7ea] bg-white px-2.5 py-1.5 text-xs font-medium text-[#405963]">{marketplace}<ExternalLink className="size-3 text-[#8a9da5]" /></span>)}</div></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
