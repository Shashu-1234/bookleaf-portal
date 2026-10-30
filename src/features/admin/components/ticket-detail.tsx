"use client";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  Mail,
  MessageSquareText,
  NotebookPen,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  ticketCategories,
  ticketPriorities,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/ai/schemas";
import { formatAge, formatCurrency } from "../formatters";
import type { AdminTicket, TicketStatus } from "../types";
import { PriorityBadge, StatusBadge } from "./ticket-badges";

const statuses: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

type TicketDetailProps = {
  ticket: AdminTicket;
  updateAction: (formData: FormData) => Promise<void>;
  noteAction: (formData: FormData) => Promise<void>;
  replyAction: (formData: FormData) => Promise<void>;
};

export function TicketDetail({ ticket, updateAction, noteAction, replyAction }: TicketDetailProps) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [category, setCategory] = useState<TicketCategory>(ticket.category);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo);
  const [draft, setDraft] = useState(ticket.draft?.body ?? "");
  const [messages, setMessages] = useState(ticket.messages);
  const [notes, setNotes] = useState(ticket.internalNotes);
  const [newNote, setNewNote] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const mutate = (field: string, value: string, message: string) => {
    const formData = new FormData();
    formData.set("field", field);
    formData.set("value", value);
    startTransition(async () => {
      await updateAction(formData);
      flash(message);
    });
  };

  const addNote = () => {
    const note = newNote.trim();
    if (!note) return;
    const formData = new FormData();
    formData.set("body", note);
    startTransition(async () => {
      await noteAction(formData);
      setNotes((current) => [...current, { id: `new-note-${current.length + 1}`, author: "BookLeaf Support", body: note, createdAt: "Just now" }]);
      setNewNote("");
      flash("Internal note saved");
    });
  };

  const sendResponse = () => {
    const body = draft.trim();
    if (!body) {
      flash("Write or generate a response before sending");
      return;
    }
    const formData = new FormData();
    formData.set("body", body);
    startTransition(async () => {
      await replyAction(formData);
      setMessages((current) => [...current, { id: `new-message-${current.length + 1}`, sender: "admin", senderName: "BookLeaf Support", body, createdAt: "Just now" }]);
      setStatus("In Progress");
      flash("Response sent and saved");
    });
  };

  return (
    <div className="space-y-5">
      {notice ? (
        <div role="status" className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#123346] px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:right-8">
          <Check className="size-4 text-emerald-300" />{notice}
        </div>
      ) : null}

      <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-[#687f89] transition hover:text-[#176786]">
        <ArrowLeft className="size-4" />Back to ticket queue
      </Link>

      <header className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)] sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#176786]">{ticket.id}</span><PriorityBadge priority={priority} /><StatusBadge status={status} /></div>
            <h1 className="mt-3 text-balance text-xl font-bold tracking-[-0.025em] text-[#172b36] sm:text-2xl">{ticket.subject}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78909b]"><span>Created {ticket.createdAt}</span><span className={ticket.ageHours >= 48 ? "font-semibold text-red-600" : ""}>{formatAge(ticket.ageHours)}</span><span>Updated {ticket.updatedAt}</span></p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[520px]">
            <ControlSelect label="Status" value={status} onChange={(value) => { setStatus(value as TicketStatus); mutate("status", value, "Status saved"); }} options={statuses} />
            <ControlSelect label="Priority" value={priority} onChange={(value) => { setPriority(value as TicketPriority); mutate("priority", value, "Priority override saved"); }} options={ticketPriorities} />
            {assignedTo ? (
              <button className="mt-[18px] inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe7ea] bg-[#f8fafb] px-3 text-sm font-semibold text-[#425c67]"><UserCheck className="size-4 text-emerald-600" />{assignedTo}</button>
            ) : (
              <button disabled={pending} onClick={() => { setAssignedTo("BookLeaf Support"); mutate("assignedTo", "self", "Ticket assigned to you"); }} className="mt-[18px] inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-3 text-sm font-semibold text-white disabled:opacity-60"><UserCheck className="size-4" />Assign to me</button>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.75fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <SectionHeader icon={MessageSquareText} title="Author conversation" subtitle="Public messages visible to the author" />
            <div className="space-y-5 p-5 sm:p-6">
              <article className="rounded-2xl border border-[#dfe7ea] bg-[#f8fafb] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#dff1f5] text-xs font-bold text-[#176786]">{ticket.author.name.split(" ").map((part) => part[0]).join("")}</span><div><p className="text-sm font-bold text-[#29434f]">{ticket.author.name}</p><p className="text-[11px] text-[#8a9da5]">Original query · {ticket.createdAt}</p></div></div></div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#4d6570]">{ticket.description}</p>
              </article>
              {messages.filter((message) => message.sender === "admin").map((message) => (
                <article key={message.id} className="ml-auto max-w-[92%] rounded-2xl border border-[#cfe7ed] bg-[#edf8fa] p-4 sm:p-5"><div className="flex items-center gap-2 text-xs font-bold text-[#176786]"><ShieldCheck className="size-4" />{message.senderName} · {message.createdAt}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#36535f]">{message.body}</p></article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <div className="flex flex-col gap-3 border-b border-[#e7edef] bg-[#fbfcfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div><div className="flex items-center gap-2"><Sparkles className="size-[18px] text-[#176786]" /><h2 className="font-bold text-[#172b36]">Response composer</h2></div><p className="mt-1 text-xs text-[#78909b]">AI suggestions are drafts. Review every fact before sending.</p></div>
              {ticket.draft ? <span className="rounded-full border border-[#cfe7ed] bg-[#edf8fa] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#176786]">AI draft · Human approval required</span> : null}
            </div>
            <div className="p-5 sm:p-6">
              {ticket.ai.state === "manual_review" ? (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800"><AlertCircle className="mt-0.5 size-4 shrink-0" /><div><p className="font-bold">AI assistance unavailable</p><p className="mt-1 leading-5 text-violet-700">The ticket remains fully actionable. Write a response manually or retry generation later.</p></div></div>
              ) : null}
              <label className="text-xs font-bold uppercase tracking-[0.12em] text-[#687f89]">Reply to {ticket.author.name}</label>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={14} placeholder="Write a response or generate an AI draft…" className="scrollbar-thin mt-2 w-full resize-y rounded-xl border border-[#dfe7ea] bg-white p-4 text-sm leading-6 text-[#36535f] outline-none transition focus:border-[#76aabd]" />
              {ticket.draft?.policyReferences.length ? <div className="mt-3 flex flex-wrap gap-2"><span className="text-xs font-semibold text-[#78909b]">Grounded in:</span>{ticket.draft.policyReferences.map((reference) => <span key={reference} className="rounded-full bg-[#f0f4f5] px-2.5 py-1 text-[10px] font-semibold text-[#58717c]">{reference}</span>)}</div> : null}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button onClick={() => flash("Draft kept in the composer until sent")} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe7ea] bg-white px-4 text-sm font-semibold text-[#425c67] hover:bg-[#f8fafb]"><Save className="size-4" />Save draft</button>
                <div className="flex gap-3"><button onClick={() => flash("AI is disabled; manual workflow remains available")} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#cfe7ed] bg-[#edf8fa] px-4 text-sm font-semibold text-[#176786] sm:flex-none"><RefreshCw className="size-4" />Regenerate</button><button disabled={pending} onClick={sendResponse} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#125a76] disabled:opacity-60 sm:flex-none"><Send className="size-4" />Send response</button></div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <SectionHeader icon={Bot} title="AI triage" subtitle={ticket.ai.model ?? "Manual review mode"} />
            <div className="space-y-4 p-5">
              {ticket.ai.state === "ready" ? (
                <><div className="rounded-xl border border-[#cfe7ed] bg-[#f4fafb] p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-[#176786]">Confidence</span><span className="text-lg font-bold text-[#176786]">{Math.round((ticket.ai.confidence ?? 0) * 100)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#d9ebef]"><div className="h-full rounded-full bg-[#2b91ad]" style={{ width: `${(ticket.ai.confidence ?? 0) * 100}%` }} /></div></div><p className="text-sm leading-6 text-[#58717c]">{ticket.ai.rationale}</p></>
              ) : (
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-800">Classification failed gracefully. The ticket was still created and can be handled manually.</div>
              )}
              <ControlSelect label="Category override" value={category} onChange={(value) => { setCategory(value as TicketCategory); mutate("category", value, "Category override saved"); }} options={ticketCategories} />
              <ControlSelect label="Priority override" value={priority} onChange={(value) => { setPriority(value as TicketPriority); mutate("priority", value, "Priority override saved"); }} options={ticketPriorities} />
              {ticket.ai.urgencySignals.length ? <div><p className="text-xs font-bold uppercase tracking-wider text-[#78909b]">Urgency signals</p><div className="mt-2 flex flex-wrap gap-2">{ticket.ai.urgencySignals.map((signal) => <span key={signal} className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">{signal}</span>)}</div></div> : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <SectionHeader icon={BookOpen} title="Author & book context" subtitle="Verified account data" />
            <div className="space-y-5 p-5 text-sm">
              <div><p className="font-bold text-[#29434f]">{ticket.author.name}</p><p className="mt-1 flex items-center gap-2 text-xs text-[#78909b]"><Mail className="size-3.5" />{ticket.author.email}</p><p className="mt-1 text-xs text-[#78909b]">{ticket.author.city} · {ticket.author.id}</p></div>
              {ticket.book ? <div className="border-t border-[#edf1f2] pt-4"><p className="font-bold text-[#29434f]">{ticket.book.title}</p><p className="mt-1 font-mono text-[11px] text-[#78909b]">{ticket.book.isbn}</p><p className="mt-2 text-xs text-[#58717c]">{ticket.book.status}</p><div className="mt-4 grid grid-cols-2 gap-3"><ContextStat label="Copies sold" value={ticket.book.totalCopiesSold.toLocaleString("en-IN")} /><ContextStat label="Royalty pending" value={formatCurrency(ticket.book.royaltyPending)} /></div><div className="mt-4 flex flex-wrap gap-1.5">{ticket.book.availableOn.map((platform) => <span key={platform} className="rounded-md bg-[#f0f4f5] px-2 py-1 text-[10px] font-medium text-[#58717c]">{platform}</span>)}</div></div> : <p className="text-xs text-[#78909b]">General / Account Level</p>}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <SectionHeader icon={NotebookPen} title="Internal notes" subtitle="Never visible to the author" />
            <div className="space-y-3 p-5">
              {notes.map((note) => <div key={note.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-sm leading-5 text-amber-950">{note.body}</p><p className="mt-2 text-[10px] font-semibold text-amber-700">{note.author} · {note.createdAt}</p></div>)}
              <textarea value={newNote} onChange={(event) => setNewNote(event.target.value)} rows={3} placeholder="Add a private note…" className="w-full resize-none rounded-xl border border-[#dfe7ea] p-3 text-sm outline-none focus:border-[#76aabd]" />
              <button onClick={addNote} disabled={!newNote.trim() || pending} className="w-full rounded-xl border border-[#dfe7ea] bg-[#f8fafb] px-3 py-2.5 text-sm font-semibold text-[#425c67] enabled:hover:bg-[#f0f4f5] disabled:cursor-not-allowed disabled:opacity-45">Add internal note</button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)]">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-[#29434f]">Activity</h2><ExternalLink className="size-4 text-[#9aabb2]" /></div>
            <div className="mt-4 space-y-4">{ticket.activity.length ? ticket.activity.map((entry) => <div key={entry.id} className="relative pl-6 before:absolute before:left-[5px] before:top-5 before:h-[calc(100%+8px)] before:w-px before:bg-[#dfe7ea] last:before:hidden"><span className="absolute left-0 top-1 size-2.5 rounded-full border-2 border-white bg-[#2b91ad] ring-1 ring-[#a9d1db]" /><p className="text-xs font-bold text-[#425c67]">{entry.label}</p><p className="mt-1 text-[11px] leading-4 text-[#78909b]">{entry.detail}</p><p className="mt-1 text-[10px] text-[#9aabb2]">{entry.createdAt}</p></div>) : <p className="text-xs text-[#78909b]">No additional activity yet.</p>}</div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Clock3; title: string; subtitle: string }) {
  return <div className="flex items-center gap-3 border-b border-[#e7edef] bg-[#fbfcfc] px-5 py-4"><span className="grid size-9 place-items-center rounded-xl bg-[#e9f5f7] text-[#176786]"><Icon className="size-[17px]" /></span><div><h2 className="text-sm font-bold text-[#172b36]">{title}</h2><p className="mt-0.5 text-[11px] text-[#78909b]">{subtitle}</p></div></div>;
}

function ControlSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.11em] text-[#78909b]">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-[#dfe7ea] bg-white px-3 text-xs font-semibold text-[#425c67] outline-none focus:border-[#76aabd]">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ContextStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f5f8f9] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#8a9da5]">{label}</p><p className="mt-1 text-sm font-bold text-[#29434f]">{value}</p></div>;
}
