import { BookOpenText, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

import { login } from "./actions";

export const instant = false;

const errors: Record<string, string> = {
  credentials: "That email and password combination was not recognised.",
  invalid: "Enter a valid email and a password of at least 8 characters.",
  access: "This account is not linked to a BookLeaf workspace.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-screen bg-[#f5f8f9] lg:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)]">
      <section className="hidden bg-[#123346] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white text-sm font-black text-[#16445c]">BL</span><div><p className="font-bold tracking-wide">BOOKLEAF</p><p className="text-xs text-sky-100/65">Author Support Portal</p></div></div>
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">One secure workspace</p><h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.04em]">Clear answers for authors. Better context for support teams.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-sky-50/65">Role-aware access, verified publishing data, human-approved responses, and a graceful manual workflow when AI is unavailable.</p><div className="mt-8 grid gap-3 text-sm text-sky-50/80">{["Database-enforced row-level access", "No automatic AI messages to authors", "Every support conversation in one place"].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-emerald-300" />{item}</div>)}</div></div>
        <p className="text-xs text-sky-50/45">Technical assignment demonstration · Synthetic data only</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><span className="grid size-11 place-items-center rounded-xl bg-[#123346] text-sm font-black text-white">BL</span></div>
          <div className="rounded-3xl border border-[#dfe7ea] bg-white p-6 shadow-[0_18px_60px_rgba(24,57,70,.08)] sm:p-8">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#e9f5f7] text-[#176786]"><LockKeyhole className="size-5" /></span>
            <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-[#172b36]">Sign in to BookLeaf</h2><p className="mt-2 text-sm leading-6 text-[#687f89]">Your role automatically opens the correct author or operations workspace.</p>
            {error ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors[error] ?? errors.credentials}</div> : null}
            <form action={login} className="mt-6 space-y-4">
              <label className="block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Email address</span><input name="email" type="email" autoComplete="email" required className="h-11 w-full rounded-xl border border-[#cad7db] px-3 text-sm outline-none focus:border-[#73aabc]" /></label>
              <label className="block space-y-2"><span className="text-sm font-semibold text-[#29434f]">Password</span><input name="password" type="password" autoComplete="current-password" required minLength={8} className="h-11 w-full rounded-xl border border-[#cad7db] px-3 text-sm outline-none focus:border-[#73aabc]" /></label>
              <button className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#176786] px-4 text-sm font-semibold text-white transition hover:bg-[#125a76]">Sign in securely</button>
            </form>
            <div className="mt-6 flex items-start gap-3 border-t border-[#edf1f2] pt-5 text-xs leading-5 text-[#78909b]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />Sessions are verified server-side and every data query is restricted by Row Level Security.</div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#78909b]"><BookOpenText className="size-4" />BookLeaf Publishing · Author care, thoughtfully delivered</div>
        </div>
      </section>
    </main>
  );
}
