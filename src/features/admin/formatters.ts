import type { TicketPriority } from "@/lib/ai/schemas";
import type { TicketStatus } from "./types";

export const priorityRank: Record<TicketPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function formatAge(ageHours: number): string {
  if (ageHours < 24) return `${ageHours}h open`;
  const days = Math.floor(ageHours / 24);
  const hours = ageHours % 24;
  return hours ? `${days}d ${hours}h open` : `${days}d open`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function statusTone(status: TicketStatus): string {
  return {
    Open: "border-blue-200 bg-blue-50 text-blue-700",
    "In Progress": "border-amber-200 bg-amber-50 text-amber-700",
    Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Closed: "border-slate-200 bg-slate-100 text-slate-600",
  }[status];
}

export function priorityTone(priority: TicketPriority): string {
  return {
    Critical: "border-red-200 bg-red-50 text-red-700",
    High: "border-orange-200 bg-orange-50 text-orange-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    Low: "border-slate-200 bg-slate-100 text-slate-600",
  }[priority];
}
