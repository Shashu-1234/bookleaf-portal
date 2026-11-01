"use client";

import { LayoutDashboard, LogOut, TicketCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Ticket queue", href: "/admin/tickets", icon: TicketCheck },
];

export function AdminShell({ children, admin }: { children: React.ReactNode; admin: { name: string; role: string; initials: string } }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[#dfe7ea] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex shrink-0 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#123346] text-sm font-black tracking-tight text-white">BL</span>
            <span><span className="block text-sm font-bold tracking-wide text-[#172b36]">BOOKLEAF</span><span className="block text-xs text-[#687f89]">Support desk</span></span>
          </Link>
          <nav aria-label="Admin navigation" className="order-last flex w-full gap-1 border-t border-[#edf1f2] pt-3 md:order-none md:w-auto md:border-0 md:pt-0">
            {navigation.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176786] ${active ? "bg-[#123346] text-white" : "text-[#5f7680] hover:bg-[#f0f5f7] hover:text-[#172b36]"}`}><Icon aria-hidden="true" className="size-4" />{item.label}</Link>;
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e9f3f6] text-xs font-bold text-[#16445c]">{admin.initials}</span>
              <span className="hidden leading-tight sm:block"><span className="block text-sm font-semibold text-[#172b36]">{admin.name}</span><span className="block text-[11px] text-[#78909b]">{admin.role}</span></span>
            </div>
            <form action="/auth/signout" method="post"><button aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-lg border border-[#dfe7ea] text-[#4d6570] hover:bg-[#f5f7f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176786]"><LogOut aria-hidden="true" className="size-[18px]" /></button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
