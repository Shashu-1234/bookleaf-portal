import type { AuthorSupportTicket } from "../types";

const statusStyles: Record<AuthorSupportTicket["status"], string> = {
  Open: "border-amber-200 bg-amber-50 text-amber-700",
  "In Progress": "border-sky-200 bg-sky-50 text-sky-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Closed: "border-slate-200 bg-slate-50 text-slate-600",
};

export function AuthorTicketStatus({ status }: { status: AuthorSupportTicket["status"] }) {
  return <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}>{status}</span>;
}
