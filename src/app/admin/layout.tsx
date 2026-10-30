import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { getCurrentStaffProfile } from "@/lib/database/admin-repository";

export const metadata: Metadata = { title: "Admin" };
export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await getCurrentStaffProfile();
  const name = staff?.display_name ?? "BookLeaf Support";
  const admin = { name, role: "Support Operations", initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() };
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AdminShell admin={admin}>{children}</AdminShell>
    </Suspense>
  );
}

function AdminShellFallback() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden bg-[#123346] lg:block" aria-hidden="true" />
      <div className="min-w-0">
        <div className="h-[76px] border-b border-[#dfe7ea] bg-white" aria-hidden="true" />
        <main className="mx-auto w-full max-w-[1600px] animate-pulse p-4 sm:p-6 lg:p-8">
          <div className="h-8 w-64 rounded-lg bg-[#e4eaec]" />
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-[#edf1f2]" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-2xl border border-[#e2e8ea] bg-white" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
