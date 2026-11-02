"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { subscribeToAuthorSupport } from "@/lib/supabase/realtime";

export function SupportLiveUpdates({ authorId }: { authorId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const active = pathname === "/author" || pathname.startsWith("/author/support");

  useEffect(() => {
    if (!active) return;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(debounce);
      debounce = setTimeout(() => startTransition(() => router.refresh()), 250);
    };
    const unsubscribe = subscribeToAuthorSupport(createClient(), authorId, refresh, refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      unsubscribe();
      clearTimeout(debounce);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [active, authorId, router]);

  // Polling preserves near-real-time delivery when websocket events are lost.
  // Pause while hidden or while a previous refresh is pending.
  useEffect(() => {
    if (!active || pending) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") startTransition(() => router.refresh());
    }, 15_000);
    return () => clearInterval(interval);
  }, [active, pending, router]);

  return null;
}
