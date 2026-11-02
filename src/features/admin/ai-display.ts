import type { AdminTicket } from "./types";

export function aiDisplay(ticket: AdminTicket, now = Date.now()) {
  const code = ticket.ai.errorCode;
  const disabled = code === "AI_DISABLED" || code === "AI_NOT_CONFIGURED" || (!code && ticket.ai.rationale?.includes("intentionally disabled"));
  if (disabled) return { title: "AI was disabled for this attempt", detail: "No provider failure was recorded. You can write manually or retry with the configured provider.", processing: false };
  if (code) return { title: ticket.draft ? "Latest AI attempt failed; previous draft retained" : "AI attempt failed", detail: `Recorded reason: ${code}. You can write manually or retry generation.`, processing: false };
  if (ticket.draft) return { title: "AI draft ready for review", detail: "Review all facts before sending. No response is sent automatically.", processing: false };
  const processing = !ticket.ai.lastRunAt && now - Date.parse(ticket.createdAtIso ?? "") < 180_000;
  return { title: processing ? "Generating AI analysis and draft" : "No AI draft generated yet", detail: processing ? "Your ticket is saved. This page will update automatically when processing finishes." : "There is no completed draft or recorded provider failure for this ticket. You can write manually or generate a draft.", processing };
}
