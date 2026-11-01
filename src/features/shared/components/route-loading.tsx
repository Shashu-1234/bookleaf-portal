type RouteLoadingProps = {
  variant?: "dashboard" | "list" | "detail" | "form";
};

const blocks = (count: number, className: string) =>
  Array.from({ length: count }, (_, index) => (
    <div key={index} className={className} />
  ));

export function RouteLoading({ variant = "list" }: RouteLoadingProps) {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading…</span>
      <header className="space-y-3">
        <div className="h-8 w-56 max-w-2/3 rounded-lg bg-[#dfe7ea]" />
        <div className="h-4 w-full max-w-xl rounded bg-[#e8edef]" />
      </header>

      {variant === "dashboard" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {blocks(4, "h-32 rounded-2xl border border-[#e2e8ea] bg-white")}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="h-80 rounded-2xl border border-[#e2e8ea] bg-white" />
            <div className="h-80 rounded-2xl border border-[#e2e8ea] bg-white" />
          </div>
        </>
      )}

      {variant === "list" && (
        <div className="overflow-hidden rounded-2xl border border-[#e2e8ea] bg-white p-5">
          <div className="mb-5 h-10 rounded-xl bg-[#edf1f2]" />
          <div className="space-y-3">
            {blocks(6, "h-16 rounded-xl bg-[#f2f5f6]")}
          </div>
        </div>
      )}

      {variant === "detail" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4 rounded-2xl border border-[#e2e8ea] bg-white p-5">
            {blocks(4, "h-20 rounded-xl bg-[#f2f5f6]")}
          </div>
          <div className="h-96 rounded-2xl border border-[#e2e8ea] bg-white" />
        </div>
      )}

      {variant === "form" && (
        <div className="max-w-3xl space-y-5 rounded-2xl border border-[#e2e8ea] bg-white p-6">
          {blocks(2, "h-11 rounded-xl bg-[#edf1f2]")}
          <div className="h-36 rounded-xl bg-[#edf1f2]" />
          <div className="h-11 w-36 rounded-xl bg-[#dfe7ea]" />
        </div>
      )}
    </div>
  );
}
