create index internal_notes_author_user_id_idx on public.internal_notes (author_user_id);
create index ticket_messages_sender_user_id_idx on public.ticket_messages (sender_user_id);
create index tickets_book_id_idx on public.tickets (book_id) where book_id is not null;

revoke execute on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.current_app_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '');
$$;

grant execute on function private.current_app_role() to authenticated;

alter policy "authors_select_own_or_admin" on public.authors
using ((select auth.uid()) = user_id or (select private.current_app_role()) in ('admin', 'ops'));

alter policy "staff_select_admin" on public.staff_profiles
using ((select private.current_app_role()) in ('admin', 'ops'));
alter policy "staff_insert_admin" on public.staff_profiles
with check ((select private.current_app_role()) = 'admin');
alter policy "staff_update_admin" on public.staff_profiles
using ((select private.current_app_role()) = 'admin')
with check ((select private.current_app_role()) = 'admin');
alter policy "staff_delete_admin" on public.staff_profiles
using ((select private.current_app_role()) = 'admin');

alter policy "books_select_owner_or_admin" on public.books
using (
  exists (
    select 1 from public.authors
    where authors.id = books.author_id and authors.user_id = (select auth.uid())
  )
  or (select private.current_app_role()) in ('admin', 'ops')
);

alter policy "payouts_select_owner_or_admin" on public.royalty_payouts
using (
  exists (
    select 1 from public.authors
    where authors.id = royalty_payouts.author_id and authors.user_id = (select auth.uid())
  )
  or (select private.current_app_role()) in ('admin', 'ops')
);

alter policy "tickets_select_owner_or_admin" on public.tickets
using (
  exists (
    select 1 from public.authors
    where authors.id = tickets.author_id and authors.user_id = (select auth.uid())
  )
  or (select private.current_app_role()) in ('admin', 'ops')
);
alter policy "tickets_update_admin" on public.tickets
using ((select private.current_app_role()) in ('admin', 'ops'))
with check ((select private.current_app_role()) in ('admin', 'ops'));

alter policy "messages_select_visible_ticket" on public.ticket_messages
using (
  exists (
    select 1
    from public.tickets
    join public.authors on authors.id = tickets.author_id
    where tickets.id = ticket_messages.ticket_id
      and (
        authors.user_id = (select auth.uid())
        or (select private.current_app_role()) in ('admin', 'ops')
      )
  )
);

drop policy "messages_insert_author" on public.ticket_messages;
drop policy "messages_insert_admin" on public.ticket_messages;
create policy "messages_insert_author_or_admin"
on public.ticket_messages for insert to authenticated
with check (
  sender_user_id = (select auth.uid())
  and (
    (
      sender = 'author'
      and exists (
        select 1
        from public.tickets
        join public.authors on authors.id = tickets.author_id
        where tickets.id = ticket_messages.ticket_id
          and authors.user_id = (select auth.uid())
          and tickets.status <> 'Closed'
      )
    )
    or (
      sender = 'admin'
      and (select private.current_app_role()) in ('admin', 'ops')
    )
  )
);

alter policy "notes_select_admin" on public.internal_notes
using ((select private.current_app_role()) in ('admin', 'ops'));
alter policy "notes_insert_admin" on public.internal_notes
with check (
  author_user_id = (select auth.uid())
  and (select private.current_app_role()) in ('admin', 'ops')
);
alter policy "notes_delete_admin" on public.internal_notes
using (
  author_user_id = (select auth.uid())
  or (select private.current_app_role()) = 'admin'
);

alter policy "ai_runs_select_admin" on public.ai_runs
using ((select private.current_app_role()) in ('admin', 'ops'));
alter policy "ai_runs_insert_admin" on public.ai_runs
with check ((select private.current_app_role()) in ('admin', 'ops'));
alter policy "ai_runs_update_admin" on public.ai_runs
using ((select private.current_app_role()) in ('admin', 'ops'))
with check ((select private.current_app_role()) in ('admin', 'ops'));
alter policy "ai_runs_delete_admin" on public.ai_runs
using ((select private.current_app_role()) = 'admin');
