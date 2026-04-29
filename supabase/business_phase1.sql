-- ============================================================
-- MY MOOD — B2B Phase 1: businesses + business_photos
-- Esegui questo script nel SQL Editor di Supabase
-- ============================================================

-- 1. Tabella businesses
create table if not exists public.businesses (
  id              uuid default gen_random_uuid() primary key,
  owner_user_id   uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  description     text,
  category        text, -- bar, ristorante, club, cocktail_bar, aperitivo, altro
  address         text,
  neighborhood    text, -- navigli, brera, porta_venezia, ecc.
  phone           text,
  website         text,
  instagram       text,
  venue_id        uuid references public.venues(id) on delete set null,
  is_verified     boolean default false,
  plan            text default 'free', -- free, pro
  cover_photo_url text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 2. Tabella business_photos
create table if not exists public.business_photos (
  id          uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  url         text not null,
  order_index integer default 0,
  caption     text,
  created_at  timestamptz default now()
);

-- 3. RLS businesses
alter table public.businesses enable row level security;

-- Tutti possono leggere i profili business
create policy "businesses_select_all"
  on public.businesses for select using (true);

-- Solo il proprietario può creare il proprio business
create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = owner_user_id);

-- Solo il proprietario può aggiornare
create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = owner_user_id);

-- Solo il proprietario può eliminare
create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = owner_user_id);

-- 4. RLS business_photos
alter table public.business_photos enable row level security;

-- Tutti possono leggere le foto
create policy "business_photos_select_all"
  on public.business_photos for select using (true);

-- Solo il proprietario del business può inserire foto
create policy "business_photos_insert_own"
  on public.business_photos for insert
  with check (
    auth.uid() = (
      select owner_user_id from public.businesses where id = business_id
    )
  );

-- Solo il proprietario può aggiornare le foto
create policy "business_photos_update_own"
  on public.business_photos for update
  using (
    auth.uid() = (
      select owner_user_id from public.businesses where id = business_id
    )
  );

-- Solo il proprietario può eliminare le foto
create policy "business_photos_delete_own"
  on public.business_photos for delete
  using (
    auth.uid() = (
      select owner_user_id from public.businesses where id = business_id
    )
  );

-- 5. Trigger aggiornamento updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function public.update_updated_at();

-- ============================================================
-- SUPABASE STORAGE — bucket per le foto business
-- Vai su Storage > New Bucket:
--   Nome: business-photos
--   Public: YES
-- Poi aggiungi questa policy nel bucket:
--   INSERT: (auth.uid() is not null)
--   SELECT: true (public)
--   DELETE: (auth.uid()::text = (storage.foldername(name))[1])
-- ============================================================
