create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  unit text not null unique,
  building text not null,
  resident_name text not null,
  email text not null,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  status text not null default 'Current'
    check (status in ('Current', 'Payment pending')),
  parking_slot text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists households_email_lower_unique
  on public.households (lower(email));

alter table public.households enable row level security;

revoke all on public.households from anon, authenticated;
grant select on public.households to authenticated;
grant all on public.households to service_role;

drop policy if exists "Homeowners can read their own household" on public.households;
create policy "Homeowners can read their own household"
  on public.households
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

