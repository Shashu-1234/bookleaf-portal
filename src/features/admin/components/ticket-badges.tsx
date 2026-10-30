import type { TicketPriority } from "@/lib/ai/schemas";
import { priorityTone, statusTone } from "../formatters";
import type { TicketStatus } from "../types";

const base =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none";

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`${base} ${priorityTone(priority)}`}>{priority}</span>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`${base} ${statusTone(status)}`}>{status}</span>;
}
