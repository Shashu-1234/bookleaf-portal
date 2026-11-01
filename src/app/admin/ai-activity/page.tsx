import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAiActivity } from "@/lib/database/admin-directory-repository";
import { parsePage } from "@/lib/pagination";
import { Pagination } from "@/features/shared/components/pagination";

export const metadata = { title: "AI activity" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { runs, pagination } = await getAdminAiActivity(parsePage(params.page));
  if (pagination.page > pagination.totalPages) redirect(`/admin/ai-activity?page=${pagination.totalPages}`);
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-[#172b36]">AI activity</h1><p className="mt-2 text-sm text-[#687f89]">Recorded analysis and draft attempts, newest first. Viewing this page makes no model calls. Missing metrics mean not recorded, not zero.</p></div>
    <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f8fafb] text-xs text-[#687f89]"><tr>{["Ticket / time", "Result", "Provider / model", "Tokens in / out", "Latency", "Failure code"].map(label => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f2]">{runs.map(run => <tr key={run.id}><td className="max-w-xs px-5 py-4">{run.tickets ? <Link className="font-semibold text-[#176786] hover:underline" href={`/admin/tickets/BL-${run.tickets.ticket_number}`}>BL-{run.tickets.ticket_number} · {run.tickets.subject}</Link> : <span>Ticket unavailable</span>}<p className="mt-1 text-xs text-[#687f89]">{new Date(run.created_at).toISOString().replace("T", " ").replace(".000Z", " UTC")}</p></td><td className="px-5 py-4"><span className={run.state === "ready" ? "text-emerald-700" : "text-amber-700"}>{run.state === "ready" ? "Ready" : "Manual review"}</span></td><td className="px-5 py-4">{run.provider ?? "Not recorded"}<p className="mt-1 text-xs text-[#687f89]">{run.model ?? "—"}</p></td><td className="px-5 py-4">{run.input_tokens ?? "—"} / {run.output_tokens ?? "—"}</td><td className="px-5 py-4">{run.latency_ms === null ? "—" : `${run.latency_ms} ms`}</td><td className="px-5 py-4 font-mono text-xs">{run.error_code ?? "—"}</td></tr>)}</tbody></table></div>{runs.length === 0 ? <div className="p-10 text-center text-sm text-[#687f89]">No AI attempts recorded yet. Audit entries appear after ticket processing or draft regeneration.</div> : null}<Pagination meta={pagination} basePath="/admin/ai-activity" itemLabel="AI runs" /></section>
  </div>;
}
