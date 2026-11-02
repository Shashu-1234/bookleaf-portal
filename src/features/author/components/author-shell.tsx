"use client";

import {
  BookOpen,
  CircleHelp,
  Headphones,
  LayoutDashboard,
  Menu,
  ReceiptIndianRupee,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SupportLiveUpdates } from "./support-live-updates";

const navigation = [
  { label: "Dashboard", href: "/author", icon: LayoutDashboard },
  { label: "My books", href: "/author/books", icon: BookOpen },
  { label: "Royalties", href: "/author/royalties", icon: ReceiptIndianRupee },
  { label: "Support", href: "/author/support", icon: Headphones },
];

export function AuthorShell({ children, author }: { children: React.ReactNode; author: { id: string; name: string; initials: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <SupportLiveUpdates authorId={author.id} />
      {mobileOpen ? (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#123346] text-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link href="/author" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black tracking-tight text-[#16445c] shadow-sm">BL</span>
            <span><span className="block text-[15px] font-bold tracking-wide">BOOKLEAF</span><span className="block text-xs text-sky-100/70">Author portal</span></span>
          </Link>
          <button aria-label="Close navigation" className="rounded-lg p-2 text-sky-100 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}><X className="size-5" /></button>
        </div>

        <nav aria-label="Author navigation" className="flex-1 space-y-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100/45">Your workspace</p>
          {navigation.map((item) => {
            const active = item.href === "/author" ? pathname === "/author" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white text-[#123346] shadow-sm" : "text-sky-50/75 hover:bg-white/8 hover:text-white"}`}>
                <Icon className="size-[18px]" /><span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100/45">Need help?</p>
          <Link href="/author/support/new" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sky-50/70 transition hover:bg-white/8 hover:text-white"><CircleHelp className="size-[18px]" />Raise a query</Link>
        </nav>

      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-[#dfe7ea] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl border border-[#dfe7ea] bg-white text-[#29434f] lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <p className="hidden text-sm font-semibold text-[#29434f] md:block">Author workspace</p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 p-1.5 text-left">
              <span className="grid size-9 place-items-center rounded-xl bg-[#176786] text-xs font-bold text-white">{author.initials}</span>
              <span className="hidden leading-tight xl:block"><span className="block text-sm font-semibold text-[#172b36]">{author.name}</span><span className="block text-[11px] text-[#78909b]">Author ID · {author.id}</span></span>
            </div>
            <form action="/auth/signout" method="post"><button aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-xl border border-[#dfe7ea] bg-white text-[#4d6570] hover:bg-[#f5f7f8]"><LogOut className="size-[18px]" /></button></form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
