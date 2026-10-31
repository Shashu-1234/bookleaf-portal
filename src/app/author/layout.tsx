import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthorShell } from "@/features/author/components/author-shell";
import { requireRole } from "@/lib/database/auth";
import { getAuthorShellProfile } from "@/lib/database/author-repository";

export const metadata: Metadata = { title: "Author Portal" };
export const instant = false;

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["author"]);
  const author = await getAuthorShellProfile();
  return (
    <Suspense fallback={<AuthorShellFallback />}>
      <AuthorShell author={author}>{children}</AuthorShell>
    </Suspense>
  );
}

function AuthorShellFallback() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden bg-[#123346] lg:block" aria-hidden="true" />
      <div className="min-w-0"><div className="h-[76px] border-b border-[#dfe7ea] bg-white" aria-hidden="true" /><main className="mx-auto w-full max-w-[1500px] animate-pulse p-4 sm:p-6 lg:p-8"><div className="h-8 w-64 rounded-lg bg-[#e4eaec]" /><div className="mt-3 h-4 w-full max-w-xl rounded bg-[#edf1f2]" /><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl border border-[#e2e8ea] bg-white" />)}</div></main></div>
    </div>
  );
}
