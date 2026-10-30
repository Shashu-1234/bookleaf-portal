"use client";

import { ArrowLeft, Info, Send } from "lucide-react";
import Link from "next/link";

import { ticketCategories } from "@/lib/ai/schemas";

import type { AuthorBook } from "../types";

export function NewQueryForm({ books, action }: { books: AuthorBook[]; action: (formData: FormData) => Promise<void> }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><Link href="/author/support" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#176786] hover:underline"><ArrowLeft className="size-4" />Back to support</Link><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#176786]">New support query</p><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#172b36] sm:text-3xl">How can we help?</h1><p className="mt-2 text-sm leading-6 text-[#687f89]">Share enough detail for the support team to investigate without asking you to repeat information.</p></div>
      <div className="flex items-start gap-3 rounded-xl border border-[#cfe7ed] bg-[#edf8fa] p-4 text-sm leading-6 text-[#28596c]"><Info className="mt-0.5 size-4 shrink-0" />Your query will be created even if AI classification is unavailable. A support administrator always reviews it before responding.</div>
      <form action={action} className="rounded-2xl border border-[#dfe7ea] bg-white p-5 shadow-[0_8px_30px_rgba(24,57,70,0.04)] sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2"><span className="text-sm font-semibold text-[#29434f]">Related book</span><select name="bookId" required defaultValue="" className="h-11 w-full rounded-xl border border-[#cad7db] bg-white px-3 text-sm text-[#29434f] outline-none transition focus:border-[#73aabc]"><option value="" disabled>Select a book</option>{books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}<option value="account">General / account level</option></select></label>
          <label className="space-y-2"><span className="text-sm font-semibold text-[#29434f]">Category</span><select name="category" required defaultValue="" className="h-11 w-full rounded-xl border border-[#cad7db] bg-white px-3 text-sm text-[#29434f] outline-none transition focus:border-[#73aabc]"><option value="" disabled>Select a category</option>{ticketCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        </div>
        <label className="mt-5 block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Subject</span><input name="subject" required minLength={8} maxLength={160} placeholder="Briefly describe the issue" className="h-11 w-full rounded-xl border border-[#cad7db] px-3 text-sm text-[#29434f] outline-none transition placeholder:text-[#a2b0b6] focus:border-[#73aabc]" /></label>
        <label className="mt-5 block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Description</span><textarea name="description" required minLength={20} maxLength={4000} rows={7} placeholder="Tell us what happened, when you noticed it and what you expected…" className="w-full resize-y rounded-xl border border-[#cad7db] p-3 text-sm leading-6 text-[#29434f] outline-none transition placeholder:text-[#a2b0b6] focus:border-[#73aabc]" /><span className="block text-right text-[11px] text-[#8a9da5]">20–4,000 characters</span></label>
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#edf1f2] pt-5 sm:flex-row sm:justify-end"><Link href="/author/support" className="inline-flex h-10 items-center justify-center rounded-xl border border-[#cad7db] px-4 text-sm font-semibold text-[#405963] hover:bg-[#f7fafb]">Cancel</Link><button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176786] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125a76]"><Send className="size-4" />Submit query</button></div>
      </form>
    </div>
  );
}
