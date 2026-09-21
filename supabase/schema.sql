-- Wedding RSVP backend schema (Postgres / Supabase)
--
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- before importing your guest list. Safe to re-run: uses IF NOT EXISTS /
-- CREATE OR REPLACE throughout.

-- ------------------------------------------------------------------
-- guests: the master invite list. One row per invitation, which may
-- represent a single person or a whole family/party. This is what
-- guest RSVP submissions are verified against.
-- ------------------------------------------------------------------
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  party_size int not null default 1,       -- max guests this invite covers
  created_at timestamptz not null default now(),
  unique (email)
);

-- ------------------------------------------------------------------
-- tables: reception seating. Adjust the seed data at the bottom to
-- match your actual floor plan (table count + seats per table) before
-- guests start RSVPing.
-- ------------------------------------------------------------------
create table if not exists reception_tables (
  table_number int primary key,
  capacity int not null,
  seats_taken int not null default 0
);

-- ------------------------------------------------------------------
-- rsvps: actual guest responses. One row per guest (upserted on
-- re-submission, so guests can update their response).
-- ------------------------------------------------------------------
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade unique,
  submitted_name text not null,
  submitted_email text not null,
  attending boolean not null,
  guest_count int not null default 1,
  message text,
  table_number int references reception_tables(table_number),
  responded_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- assign_table: atomically finds a table with enough free seats for
-- party_size and reserves them, returning the table number. Returns
-- null if no table currently has room (you'll need to add more
-- tables or capacity).
-- ------------------------------------------------------------------
create or replace function assign_table(party_size int)
returns int
language plpgsql
as $$
declare
  chosen_table int;
begin
  update reception_tables
  set seats_taken = seats_taken + party_size
  where table_number = (
    select table_number
    from reception_tables
    where capacity - seats_taken >= party_size
    order by table_number
    limit 1
    for update skip locked
  )
  returning table_number into chosen_table;

  return chosen_table;
end;
$$;

-- ------------------------------------------------------------------
-- release_table: frees seats back up (used when a guest who was
-- attending changes their RSVP to not attending, or updates their
-- guest count).
-- ------------------------------------------------------------------
create or replace function release_table(t_number int, seats int)
returns void
language sql
as $$
  update reception_tables
  set seats_taken = greatest(0, seats_taken - seats)
  where table_number = t_number;
$$;

-- ------------------------------------------------------------------
-- Seed 20 tables x 10 seats = 200 capacity. Edit to match your venue
-- before going live — e.g. re-run with different numbers, or:
--   update reception_tables set capacity = 8 where table_number = 5;
-- ------------------------------------------------------------------
insert into reception_tables (table_number, capacity)
select generate_series(1, 20), 10
on conflict (table_number) do nothing;

-- ------------------------------------------------------------------
-- Row Level Security: lock these tables down from the public anon
-- key. The Netlify Function uses the service_role key (server-side
-- only, never exposed to the browser) which bypasses RLS.
-- ------------------------------------------------------------------
alter table guests enable row level security;
alter table reception_tables enable row level security;
alter table rsvps enable row level security;
