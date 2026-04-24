-- Tabella per i voti/RSVP sui piani condivisi via link
create table if not exists public.plan_votes (
  id          uuid default gen_random_uuid() primary key,
  share_id    uuid not null references public.shared_plans(id) on delete cascade,
  voter_name  text not null,
  response    text not null check (response in ('yes', 'no', 'maybe')),
  created_at  timestamptz default now()
);

-- Indice per query veloci per share_id
create index if not exists plan_votes_share_id_idx on public.plan_votes(share_id);

-- RLS: chiunque può leggere i voti, chiunque può inserire (no auth richiesta)
alter table public.plan_votes enable row level security;

create policy "Anyone can read votes" on public.plan_votes
  for select using (true);

create policy "Anyone can insert a vote" on public.plan_votes
  for insert with check (true);

-- profiles: aggiungi colonne per onboarding (se non esistono)
alter table public.profiles 
  add column if not exists cognome text,
  add column if not exists data_nascita date,
  add column if not exists nazionalita text,
  add column if not exists onboarding_complete boolean default false;
