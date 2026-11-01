import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAuthors } from "@/lib/database/admin-directory-repository";
import { parsePage } from "@/lib/pagination";
import { Pagination } from "@/features/shared/components/pagination";
import { currency } from "@/features/author/formatters";

export const metadata = { title: "Authors" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").slice(0, 100);
  const { authors, pagination } = await getAdminAuthors(parsePage(params.page), search);
  if (pagination.page > pagination.totalPages) redirect(`/admin/authors?page=${pagination.totalPages}&q=${encodeURIComponent(search)}`);
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-[#172b36]">Authors</h1><p className="mt-2 text-sm text-[#687f89]">Publishing records, book status and royalty balances.</p></div>
    <form className="flex gap-3" method="get"><label className="flex-1"><span className="sr-only">Search authors</span><input name="q" defaultValue={search} maxLength={100} placeholder="Search name, email or author ID" className="h-11 w-full rounded-xl border border-[#dfe7ea] bg-white px-4 text-sm" /></label><button className="rounded-xl bg-[#176786] px-5 text-sm font-semibold text-white">Search</button>{search ? <Link className="self-center text-sm text-[#176786]" href="/admin/authors">Clear</Link> : null}</form>
    <div className="grid gap-4 xl:grid-cols-2">{authors.map(author => <article key={author.id} className="rounded-2xl border border-[#dfe7ea] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-[#172b36]">{author.name}</h2><p className="mt-1 break-all text-xs text-[#687f89]">{author.id} · {author.email}</p><p className="mt-1 text-xs text-[#687f89]">{author.city ?? "City not provided"}</p></div><Link className="text-sm font-semibold text-[#176786] hover:underline" href={`/admin/tickets?author=${author.id}`}>View tickets</Link></div>
      <dl className="my-4 flex flex-wrap gap-6 text-sm"><div><dt className="text-xs text-[#687f89]">Books</dt><dd className="font-semibold">{author.books.length}</dd></div><div><dt className="text-xs text-[#687f89]">Earned</dt><dd className="font-semibold">{currency.format(author.books.reduce((sum, b) => sum + Number(b.total_royalty_earned), 0))}</dd></div><div><dt className="text-xs text-[#687f89]">Pending</dt><dd className="font-semibold text-amber-700">{currency.format(author.books.reduce((sum, b) => sum + Number(b.royalty_pending), 0))}</dd></div></dl>
      <ul className="space-y-2 border-t border-[#edf1f2] pt-4">{author.books.map(book => <li key={book.id} className="flex flex-wrap justify-between gap-2 text-sm"><span>{book.title}</span><span className="text-xs text-[#687f89]">{book.status}</span></li>)}</ul>{author.books.length === 0 ? <p className="text-sm text-[#687f89]">No books linked.</p> : null}
    </article>)}</div>
    {authors.length === 0 ? <p className="rounded-2xl border border-[#dfe7ea] bg-white p-10 text-center text-sm text-[#687f89]">No authors match your search.</p> : null}
    <Pagination meta={pagination} basePath="/admin/authors" query={{ q: search }} itemLabel="authors" />
  </div>;
}
