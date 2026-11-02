"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLiveUpdates() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      clearTimeout(debounce);
      debounce = setTimeout(() => startTransition(() => router.refresh()), 250);
    };
    const client = createClient();
    const channel = client.channel("admin-support-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "ticket_messages" }, refresh)
      .subscribe();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(debounce);
      void client.removeChannel(channel);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  useEffect(() => {
    if (pending) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") startTransition(() => router.refresh());
    }, 10_000);
    return () => clearInterval(interval);
  }, [pending, router]);
  return null;
}
