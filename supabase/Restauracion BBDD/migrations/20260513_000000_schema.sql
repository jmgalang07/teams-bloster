-- Supabase schema for Team's Bloster
create extension if not exists pgcrypto;

do $$
begin
  create type public.source_type as enum ('seed', 'custom');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.carp_type as enum ('royal', 'common', 'koi', 'barbo', 'pez-gato');
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text,
  source_path text,
  entity_type text,
  entity_id text,
  kind text not null default 'image',
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

create table if not exists public.fish_types (
  id public.carp_type primary key,
  label text not null,
  badge text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.water_type_options (
  id text primary key,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.water_difficulty_options (
  id text primary key,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.baits (
  id text primary key,
  name text not null,
  category text not null,
  style text not null,
  description text not null,
  image text not null,
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id text primary key,
  name text not null,
  role text not null,
  intro text not null,
  image text not null,
  accent text,
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waters (
  id text primary key,
  name text not null,
  short_name text not null,
  type text not null,
  province text not null,
  description text not null,
  known_for text not null,
  best_season text not null,
  difficulty text not null,
  image text not null,
  tags text[] not null default ARRAY[]::text[],
  notes text not null,
  website text not null default '',
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_favorite_baits (
  member_id text not null references public.members(id) on delete cascade,
  bait_id text not null references public.baits(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (member_id, bait_id)
);

create table if not exists public.member_home_waters (
  member_id text not null references public.members(id) on delete cascade,
  water_id text not null references public.waters(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (member_id, water_id)
);

create table if not exists public.catches (
  id text primary key,
  member_id text not null references public.members(id) on delete restrict,
  water_id text not null references public.waters(id) on delete cascade,
  bait_id text not null references public.baits(id) on delete restrict,
  carp_type public.carp_type not null default 'common',
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  caught_on date not null,
  rig text not null,
  image text not null,
  notes text not null default '',
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id text primary key,
  name text not null,
  specialty text not null,
  known_for text,
  featured_products text[] not null default ARRAY[]::text[],
  description text not null,
  image text not null,
  url text not null default '',
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bait_brands (
  id text primary key,
  name text not null,
  specialty text not null,
  featured_products text[] not null default ARRAY[]::text[],
  description text not null,
  image text not null,
  url text not null default '',
  source public.source_type not null default 'seed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catches_member_id_idx on public.catches(member_id);
create index if not exists catches_water_id_idx on public.catches(water_id);
create index if not exists catches_bait_id_idx on public.catches(bait_id);
create index if not exists catches_caught_on_idx on public.catches(caught_on desc);
create index if not exists waters_type_idx on public.waters(type);
create index if not exists waters_province_idx on public.waters(province);
create index if not exists assets_entity_idx on public.assets(entity_type, entity_id);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
drop trigger if exists set_assets_updated_at on public.assets;
create trigger set_assets_updated_at before update on public.assets for each row execute function public.set_updated_at();
drop trigger if exists set_fish_types_updated_at on public.fish_types;
create trigger set_fish_types_updated_at before update on public.fish_types for each row execute function public.set_updated_at();
drop trigger if exists set_water_type_options_updated_at on public.water_type_options;
create trigger set_water_type_options_updated_at before update on public.water_type_options for each row execute function public.set_updated_at();
drop trigger if exists set_water_difficulty_options_updated_at on public.water_difficulty_options;
create trigger set_water_difficulty_options_updated_at before update on public.water_difficulty_options for each row execute function public.set_updated_at();
drop trigger if exists set_baits_updated_at on public.baits;
create trigger set_baits_updated_at before update on public.baits for each row execute function public.set_updated_at();
drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at before update on public.members for each row execute function public.set_updated_at();
drop trigger if exists set_waters_updated_at on public.waters;
create trigger set_waters_updated_at before update on public.waters for each row execute function public.set_updated_at();
drop trigger if exists set_member_favorite_baits_updated_at on public.member_favorite_baits;
create trigger set_member_favorite_baits_updated_at before update on public.member_favorite_baits for each row execute function public.set_updated_at();
drop trigger if exists set_member_home_waters_updated_at on public.member_home_waters;
create trigger set_member_home_waters_updated_at before update on public.member_home_waters for each row execute function public.set_updated_at();
drop trigger if exists set_catches_updated_at on public.catches;
create trigger set_catches_updated_at before update on public.catches for each row execute function public.set_updated_at();
drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at before update on public.brands for each row execute function public.set_updated_at();
drop trigger if exists set_bait_brands_updated_at on public.bait_brands;
create trigger set_bait_brands_updated_at before update on public.bait_brands for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-assets',
  'team-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.site_settings enable row level security;
alter table public.assets enable row level security;
alter table public.fish_types enable row level security;
alter table public.water_type_options enable row level security;
alter table public.water_difficulty_options enable row level security;
alter table public.baits enable row level security;
alter table public.members enable row level security;
alter table public.waters enable row level security;
alter table public.member_favorite_baits enable row level security;
alter table public.member_home_waters enable row level security;
alter table public.catches enable row level security;
alter table public.brands enable row level security;
alter table public.bait_brands enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array ARRAY[
    'site_settings','assets','fish_types','water_type_options','water_difficulty_options',
    'baits','members','waters','member_favorite_baits','member_home_waters','catches','brands','bait_brands'
  ] loop
    execute format('drop policy if exists "Public read %s" on public.%I', table_name, table_name);
    execute format('create policy "Public read %s" on public.%I for select to anon, authenticated using (true)', table_name, table_name);
  end loop;
end $$;

drop policy if exists "Public insert assets" on public.assets;
create policy "Public insert assets" on public.assets for insert to anon, authenticated with check (true);
drop policy if exists "Public update assets" on public.assets;
create policy "Public update assets" on public.assets for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public insert waters" on public.waters;
create policy "Public insert waters" on public.waters for insert to anon, authenticated with check (true);
drop policy if exists "Public update waters" on public.waters;
create policy "Public update waters" on public.waters for update to anon, authenticated using (true) with check (true);
drop policy if exists "Public delete waters" on public.waters;
create policy "Public delete waters" on public.waters for delete to anon, authenticated using (true);

drop policy if exists "Public insert catches" on public.catches;
create policy "Public insert catches" on public.catches for insert to anon, authenticated with check (true);
drop policy if exists "Public update catches" on public.catches;
create policy "Public update catches" on public.catches for update to anon, authenticated using (true) with check (true);
drop policy if exists "Public delete catches" on public.catches;
create policy "Public delete catches" on public.catches for delete to anon, authenticated using (true);

drop policy if exists "Public read team assets" on storage.objects;
create policy "Public read team assets" on storage.objects for select to public using (bucket_id = 'team-assets');
drop policy if exists "Public upload team assets" on storage.objects;
create policy "Public upload team assets" on storage.objects for insert to anon, authenticated with check (bucket_id = 'team-assets');
drop policy if exists "Public update team assets" on storage.objects;
create policy "Public update team assets" on storage.objects for update to anon, authenticated using (bucket_id = 'team-assets') with check (bucket_id = 'team-assets');
drop policy if exists "Public delete team assets" on storage.objects;
create policy "Public delete team assets" on storage.objects for delete to anon, authenticated using (bucket_id = 'team-assets');
