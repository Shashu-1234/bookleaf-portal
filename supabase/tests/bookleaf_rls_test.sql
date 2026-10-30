begin;

select plan(16);

select ok((select relrowsecurity from pg_class where oid = 'public.authors'::regclass), 'authors has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.books'::regclass), 'books has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.royalty_payouts'::regclass), 'royalty_payouts has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.tickets'::regclass), 'tickets has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.ticket_messages'::regclass), 'ticket_messages has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.internal_notes'::regclass), 'internal_notes has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.ai_runs'::regclass), 'ai_runs has RLS enabled');

select ok(not has_table_privilege('anon', 'public.authors', 'select'), 'anonymous users cannot select authors');
select ok(not has_table_privilege('anon', 'public.books', 'select'), 'anonymous users cannot select books');
select ok(not has_table_privilege('anon', 'public.tickets', 'select'), 'anonymous users cannot select tickets');
select ok(not has_table_privilege('anon', 'public.ticket_messages', 'insert'), 'anonymous users cannot insert messages');

select ok(has_table_privilege('authenticated', 'public.authors', 'select'), 'authenticated users query authors through RLS');
select ok(has_table_privilege('authenticated', 'public.books', 'select'), 'authenticated users query books through RLS');
select ok(has_table_privilege('authenticated', 'public.tickets', 'insert'), 'authenticated users create tickets through RLS');
select ok(has_table_privilege('authenticated', 'public.ticket_messages', 'insert'), 'authenticated users reply through RLS');

select is(
  (select count(*)::integer from pg_policies where schemaname = 'public'),
  20,
  'all expected public RLS policies are installed'
);

select * from finish();
rollback;
