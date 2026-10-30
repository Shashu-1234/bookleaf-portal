"use client";

import { ArrowLeft, BookOpen, CheckCircle2, Clock3, MessageSquareReply, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { AuthorBook, AuthorSupportTicket } from "../types";
import { AuthorTicketStatus } from "./support-badges";

export function SupportTicketDetail({ ticket, book, author, replyAction }: { ticket: AuthorSupportTicket; book: AuthorBook | null; author: { name: string; initials: string }; replyAction: (formData: FormData) => Promise<void> }) {
  const [reply, setReply] = useState("");
  const closed = ticket.status === "Closed";

  return (
    <div className="space-y-6">
      <div><Link href="/author/support" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#176786] hover:underline"><ArrowLeft className="size-4" />Back to support</Link><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[#176786]">{ticket.id}</span><AuthorTicketStatus status={ticket.status} /></div><h1 className="max-w-3xl text-2xl font-bold tracking-[-0.03em] text-[#172b36]">{ticket.subject}</h1><p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#78909b]"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />Created {ticket.createdAt}</span><span className="inline-flex items-center gap-1.5"><BookOpen className="size-3.5" />{book?.title ?? "General account query"}</span></p></div></div></div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-2xl border border-[#dfe7ea] bg-white">
          <div className="border-b border-[#e7edef] px-5 py-4 sm:px-6"><h2 className="font-bold text-[#172b36]">Conversation</h2><p className="mt-1 text-xs text-[#78909b]">Replies from BookLeaf appear here</p></div>
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex justify-end gap-3"><div className="max-w-2xl rounded-2xl rounded-tr-md border border-[#cfe7ed] bg-[#edf8fa] px-4 py-3 text-[#29434f]"><div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"><p className="text-xs font-bold text-[#176786]">Original query</p><span className="text-[10px] text-[#78909b]">{ticket.createdAt}</span></div><p className="whitespace-pre-wrap text-sm leading-6">{ticket.description}</p></div><span title={author.name} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dff1f5] text-[10px] font-bold text-[#176786]">{author.initials}</span></div>
            {ticket.messages.map((message) => { const support = message.sender === "support"; return <div key={message.id} className={`flex gap-3 ${support ? "" : "justify-end"}`}>{support ? <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#123346] text-[10px] font-bold text-white">BL</span> : null}<div className={`max-w-2xl rounded-2xl px-4 py-3 ${support ? "rounded-tl-md bg-[#f1f6f7] text-[#29434f]" : "rounded-tr-md bg-[#176786] text-white"}`}><div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1"><p className={`text-xs font-bold ${support ? "text-[#176786]" : "text-sky-100"}`}>{message.senderName}</p><span className={`text-[10px] ${support ? "text-[#8a9da5]" : "text-sky-100/70"}`}>{message.createdAt}</span></div><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p></div>{support ? null : <span title={author.name} className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dff1f5] text-[10px] font-bold text-[#176786]">{author.initials}</span>}</div>; })}
          </div>
          {!closed ? <form action={replyAction} className="border-t border-[#e7edef] bg-[#fbfcfc] p-5 sm:p-6"><label className="text-sm font-semibold text-[#29434f]" htmlFor="ticket-reply">Add a reply</label><textarea name="body" id="ticket-reply" required minLength={1} maxLength={4000} value={reply} onChange={(event) => setReply(event.target.value)} rows={4} placeholder="Continue the conversation…" className="mt-2 w-full resize-y rounded-xl border border-[#cad7db] bg-white p-3 text-sm leading-6 outline-none transition placeholder:text-[#a2b0b6] focus:border-[#73aabc]" /><div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><p className="text-[11px] text-[#8a9da5]">Your reply is saved securely to this conversation.</p><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white hover:bg-[#125a76]"><Send className="size-4" />Send reply</button></div></form> : null}
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#dfe7ea] bg-white p-5"><h2 className="font-bold text-[#172b36]">Query details</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-[#78909b]">Category</dt><dd className="mt-1 font-semibold text-[#29434f]">{ticket.category}</dd></div><div><dt className="text-xs text-[#78909b]">Related book</dt><dd className="mt-1 font-semibold text-[#29434f]">{book?.title ?? "General account query"}</dd></div><div><dt className="text-xs text-[#78909b]">Last updated</dt><dd className="mt-1 font-semibold text-[#29434f]">{ticket.updatedAt}</dd></div></dl></section>
          <section className="rounded-2xl bg-[#123346] p-5 text-white"><span className="grid size-9 place-items-center rounded-xl bg-white/10 text-sky-100"><MessageSquareReply className="size-[18px]" /></span><h2 className="mt-4 font-bold">What happens next?</h2><p className="mt-2 text-sm leading-6 text-sky-50/65">A support administrator reviews the details, verifies the relevant records and replies in this conversation.</p><div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-emerald-200"><CheckCircle2 className="size-4" />Every response is human-approved</div></section>
        </aside>
      </div>
    </div>
  );
}
