"use client";

import {
  Bell,
  BookOpenText,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Sparkles,
  LogOut,
  TicketCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Ticket queue", href: "/admin/tickets", icon: TicketCheck, badge: "5" },
  { label: "Authors", href: "/admin/authors", icon: Users, disabled: true },
  { label: "Knowledge base", href: "/admin/knowledge", icon: BookOpenText, disabled: true },
];

export function AdminShell({ children, admin }: { children: React.ReactNode; admin: { name: string; role: string; initials: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {mobileOpen ? (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col bg-[#123346] text-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black tracking-tight text-[#16445c] shadow-sm">BL</span>
            <span>
              <span className="block text-[15px] font-bold tracking-wide">BOOKLEAF</span>
              <span className="block text-xs text-sky-100/70">Support desk</span>
            </span>
          </Link>
          <button aria-label="Close navigation" className="rounded-lg p-2 text-sky-100 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100/45">Workspace</p>
          {navigation.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div key={item.href} className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sky-100/35" title="Coming in a later phase">
                  <Icon className="size-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Later</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white text-[#123346] shadow-sm" : "text-sky-50/75 hover:bg-white/8 hover:text-white"}`}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-[#dff1f5] text-[#176786]" : "bg-white/10 text-white"}`}>{item.badge}</span> : null}
              </Link>
            );
          })}

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100/45">System</p>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sky-50/45"><Settings className="size-[18px]" />Settings</div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sky-50/45"><CircleHelp className="size-[18px]" />Help & support</div>
        </nav>

        <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-200">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-50" /><span className="relative inline-flex size-2 rounded-full bg-emerald-300" /></span>
            Manual fallback ready
          </div>
          <p className="text-xs leading-5 text-sky-50/55">Live database · No external AI request on this screen</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-[#dfe7ea] bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl border border-[#dfe7ea] bg-white text-[#29434f] lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          <Link href="/admin/tickets" className="relative hidden max-w-md flex-1 md:block" aria-label="Search the ticket queue">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#78909b]" />
            <span className="flex h-10 w-full items-center rounded-xl border border-[#dfe7ea] bg-[#f8fafb] pl-10 pr-4 text-sm text-[#8a9da5] transition hover:border-[#b9ccd3] hover:bg-white">Search tickets, authors, ISBNs…</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#cfe7ed] bg-[#edf8fa] px-3 py-2 text-xs font-semibold text-[#176786] sm:flex"><Sparkles className="size-3.5" />AI-assisted workspace</div>
            <button aria-label="Notifications" className="relative grid size-10 place-items-center rounded-xl border border-[#dfe7ea] bg-white text-[#4d6570] hover:bg-[#f5f7f8]">
              <Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
            </button>
            <button aria-label="Open admin profile menu" className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-[#f5f7f8]">
              <span className="grid size-9 place-items-center rounded-xl bg-[#16445c] text-xs font-bold text-white">{admin.initials}</span>
              <span className="hidden leading-tight xl:block"><span className="block text-sm font-semibold text-[#172b36]">{admin.name}</span><span className="block text-[11px] text-[#78909b]">{admin.role}</span></span>
              <ChevronRight className="hidden size-4 text-[#9aabb2] xl:block" />
            </button>
            <form action="/auth/signout" method="post"><button aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-xl border border-[#dfe7ea] bg-white text-[#4d6570] hover:bg-[#f5f7f8]"><LogOut className="size-[18px]" /></button></form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
