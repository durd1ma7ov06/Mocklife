-- ==============================================================================
-- IELTIX Platform - Supabase PostgreSQL Schema
-- Run this in Supabase Dashboard -> SQL Editor to create candidates table
-- ==============================================================================

create table if not exists public.candidates (
  id text primary key,
  email text,
  name text,
  target_band text,
  exam_date text,
  active_mode text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.candidates enable row level security;

-- Drop existing policy if exists and create full access policy
drop policy if exists "Allow public read and insert" on public.candidates;
create policy "Allow public read and insert" on public.candidates
  for all using (true) with check (true);

-- Insert sample initial candidate
insert into public.candidates (id, email, name, target_band, exam_date, active_mode)
values ('usr-admin-01', 'mansur@ieltix.uz', 'Mansur Toshmatov', '7.5 Academic', '2025-11-15', 'IELTS')
on conflict (id) do nothing;
