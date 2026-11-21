-- Only run in a dedicated UNI RESIDENTIA Supabase project. Review before deployment.
create table if not exists public.applications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 5 and 35),
  university text not null check (university in ('up','uj','wits','other')),
  student_number text not null default '' check (char_length(student_number)<=50),
  study_year text not null check (study_year in ('1','2','3','4','pg')),
  residence text not null check (residence in ('pretoria','johannesburg')),
  room_type text not null check (room_type in ('single','shared','premium')),
  status text not null default 'pending' check (status in ('pending','reviewing','accepted','declined')),
  created_at timestamptz not null default now()
);
create index if not exists applications_user_created_idx on public.applications(user_id,created_at desc);
alter table public.applications enable row level security;
revoke all on public.applications from anon;
revoke all on public.applications from authenticated;
grant select,insert on public.applications to authenticated;
drop policy if exists "applicant_view_own" on public.applications;
create policy "applicant_view_own" on public.applications for select to authenticated
using ((select auth.uid())=user_id);
drop policy if exists "applicant_insert_own" on public.applications;
create policy "applicant_insert_own" on public.applications for insert to authenticated
with check ((select auth.uid())=user_id and status='pending' and lower(email)=lower((select auth.jwt()->>'email')));
-- No user update/delete policy. Staff review and admin role authorization require separate implementation.
