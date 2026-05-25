-- Team's Bloster - autenticacion de administradores y RLS segura
-- Ejecuta este archivo en Supabase > SQL Editor despues de tener las tablas creadas.
-- Resultado: lectura publica para pescadores/visitantes y escritura solo para admins.

begin;

create table if not exists public.admin_users (
  email text primary key,
  display_name text,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email, display_name)
values ('juanmagg2004@gmail.com', 'Juanma')
on conflict (email) do nothing;

alter table public.admin_users enable row level security;

grant usage on schema public to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

grant select, insert, update, delete on public.admin_users to authenticated;

drop policy if exists "Admins read admin users" on public.admin_users;
create policy "Admins read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins insert admin users" on public.admin_users;
create policy "Admins insert admin users"
on public.admin_users
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins update admin users" on public.admin_users;
create policy "Admins update admin users"
on public.admin_users
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete admin users" on public.admin_users;
create policy "Admins delete admin users"
on public.admin_users
for delete
to authenticated
using (public.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array ARRAY[
    'site_settings',
    'assets',
    'fish_types',
    'water_type_options',
    'water_difficulty_options',
    'baits',
    'members',
    'waters',
    'member_favorite_baits',
    'member_home_waters',
    'catches',
    'brands',
    'bait_brands'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);

    execute format('drop policy if exists %I on public.%I', 'Public read ' || table_name, table_name);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', 'Public read ' || table_name, table_name);

    execute format('drop policy if exists %I on public.%I', 'Public insert ' || table_name, table_name);
    execute format('drop policy if exists %I on public.%I', 'Public update ' || table_name, table_name);
    execute format('drop policy if exists %I on public.%I', 'Public delete ' || table_name, table_name);

    execute format('drop policy if exists %I on public.%I', 'Admin insert ' || table_name, table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', 'Admin insert ' || table_name, table_name);

    execute format('drop policy if exists %I on public.%I', 'Admin update ' || table_name, table_name);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', 'Admin update ' || table_name, table_name);

    execute format('drop policy if exists %I on public.%I', 'Admin delete ' || table_name, table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', 'Admin delete ' || table_name, table_name);
  end loop;
end $$;

-- Storage: el bucket sigue siendo publico para leer imagenes, pero subir/editar/borrar queda solo para admins.
drop policy if exists "Public read team assets" on storage.objects;
create policy "Public read team assets"
on storage.objects
for select
to public
using (bucket_id = 'team-assets');

drop policy if exists "Public upload team assets" on storage.objects;
drop policy if exists "Public update team assets" on storage.objects;
drop policy if exists "Public delete team assets" on storage.objects;

drop policy if exists "Admin upload team assets" on storage.objects;
create policy "Admin upload team assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'team-assets' and public.is_admin());

drop policy if exists "Admin update team assets" on storage.objects;
create policy "Admin update team assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'team-assets' and public.is_admin())
with check (bucket_id = 'team-assets' and public.is_admin());

drop policy if exists "Admin delete team assets" on storage.objects;
create policy "Admin delete team assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'team-assets' and public.is_admin());

commit;
