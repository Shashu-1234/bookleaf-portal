import type { RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "./database.types";

type TicketRow = Tables<"tickets">;
type MessageRow = Tables<"ticket_messages">;

export function subscribeToAuthorSupport(
  supabase: SupabaseClient<Database>,
  authorId: string,
  onTicketChange: (payload: RealtimePostgresChangesPayload<TicketRow>) => void,
  onMessageChange: (payload: RealtimePostgresChangesPayload<MessageRow>) => void,
) {
  const channel = supabase
    .channel(`author-support:${authorId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "tickets", filter: `author_id=eq.${authorId}` }, onTicketChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "ticket_messages" }, onMessageChange)
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
