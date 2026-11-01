"use client";

import { ArrowLeft, Info, Paperclip, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { apiFetch } from "@/lib/api/client";
import type { AuthorBookOption } from "../types";

export function NewQueryForm({ books }: { books: AuthorBookOption[] }) {
  const router = useRouter();
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitError("");
    startTransition(async () => {
      try {
        const ticket = await apiFetch<{ id: string }>("/api/v1/tickets", { method: "POST", body: JSON.stringify({ bookId: form.get("bookId") === "account" ? null : form.get("bookId"), subject: form.get("subject"), description: form.get("description") }) });
        router.push(`/author/support/${ticket.id}`);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Unable to submit the query.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><Link href="/author/support" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#176786] hover:underline"><ArrowLeft className="size-4" />Back to support</Link><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">New support query</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">How can we help?</h1><p className="mt-2 text-sm leading-6 text-[#687f89]">Share enough detail for the support team to investigate without asking you to repeat information.</p></div>
      <div className="flex items-start gap-3 rounded-xl border border-[#cfe7ed] bg-[#edf8fa] p-4 text-sm leading-6 text-[#28596c]"><Info className="mt-0.5 size-4 shrink-0" />Your query will be created even if AI classification is unavailable. A support administrator always reviews it before responding.</div>
      <form onSubmit={submit} className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)] sm:p-7">
        <label className="block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Related book</span><select name="bookId" required defaultValue="" className="h-11 w-full rounded-xl border border-[#cad7db] bg-white px-3 text-sm text-[#29434f] outline-none transition focus:border-[#73aabc]"><option value="" disabled>Select a book</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}<option value="account">General / account level</option></select></label>
        <label className="mt-5 block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Subject</span><input name="subject" required minLength={8} maxLength={160} placeholder="Briefly describe the issue" className="h-11 w-full rounded-xl border border-[#cad7db] px-3 text-sm text-[#29434f] outline-none transition placeholder:text-[#a2b0b6] focus:border-[#73aabc]" /></label>
        <label className="mt-5 block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Description</span><textarea name="description" required minLength={20} maxLength={4000} rows={7} placeholder="Tell us what happened, when you noticed it and what you expected…" className="w-full resize-y rounded-xl border border-[#cad7db] p-3 text-sm leading-6 text-[#29434f] outline-none transition placeholder:text-[#a2b0b6] focus:border-[#73aabc]" /><span className="block text-right text-[11px] text-[#8a9da5]">20–4,000 characters</span></label>
        <div className="mt-5">
          <label htmlFor="query-attachment" className="text-sm font-semibold text-[#29434f]">Attachment <span className="font-normal text-[#78909b]">(optional)</span></label>
          <label htmlFor="query-attachment" className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#b9ccd3] bg-[#f8fbfc] p-4 transition hover:border-[#73aabc] hover:bg-[#f2f8f9]">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#176786] shadow-sm"><Paperclip className="size-[18px]" /></span>
            <span><span className="block text-sm font-semibold text-[#405963]">{attachmentName || "Choose a supporting file"}</span><span className="mt-0.5 block text-xs text-[#78909b]">PDF, JPG or PNG up to 5 MB</span></span>
          </label>
          <input id="query-attachment" name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) { setAttachmentName(""); setAttachmentError(""); return; } if (file.size > 5 * 1024 * 1024) { event.target.value = ""; setAttachmentName(""); setAttachmentError("Choose a file smaller than 5 MB."); return; } setAttachmentName(file.name); setAttachmentError(""); }} aria-describedby={attachmentError ? "attachment-error" : undefined} />
          {attachmentError ? <p id="attachment-error" role="alert" className="mt-2 text-xs font-medium text-red-700">{attachmentError}</p> : null}
        </div>
        {submitError ? <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf1f2] pt-5 sm:flex-row sm:justify-end"><Link href="/author/support" className="inline-flex h-10 items-center justify-center rounded-xl border border-[#cad7db] px-4 text-sm font-semibold text-[#405963] hover:bg-[#f7fafb]">Cancel</Link><button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76] disabled:opacity-60"><Send className="size-4" />{pending ? "Submitting…" : "Submit query"}</button></div>
      </form>
    </div>
  );
}
