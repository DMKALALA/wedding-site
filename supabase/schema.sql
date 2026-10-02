-- Wedding RSVP backend schema (Postgres / Supabase)
--
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query)
-- before importing your guest list. Safe to re-run: uses IF NOT EXISTS /
-- CREATE OR REPLACE throughout.
--
-- If you already ran an earlier version of this file against a live
-- project, run supabase/migration_open_rsvp.sql instead -- it transforms
-- the old schema into this one in place, without losing data.

-- ------------------------------------------------------------------
-- guests: the couple's own roster, used only to power live name
-- suggestions on the RSVP form (see netlify/functions/guest-suggest.js).
-- It is NOT a gate -- a guest can RSVP under any name, whether or not
-- it matches a row here, and the invite code is what actually controls
-- access. Names are intentionally not unique: two guests can share a
-- first name, and a plus-one may reuse the invitee's own name.
-- ------------------------------------------------------------------
create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,                              -- optional, just for your records
  party_size int not null default 1,       -- informational only
  created_at timestamptz not null default now()
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
-- rsvps: one row per ATTENDING PERSON, not one row per party. A party
-- of three attending guests becomes three rows that share the same
-- party_key and submitted_name -- that's how "duplicate their name
-- for themselves and their plus one" is represented when saving.
-- party_key (lowercased, trimmed name) identifies a submission so a
-- guest resubmitting under the same name replaces their previous rows
-- instead of duplicating them.
-- ------------------------------------------------------------------
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  party_key text not null,
  submitted_name text not null,
  submitted_email text,
  attending boolean not null,
  table_number int references reception_tables(table_number),
  message text,
  responded_at timestamptz not null default now()
);

create index if not exists rsvps_party_key_idx on rsvps (party_key);

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
-- key. The Netlify Functions use the service_role key (server-side
-- only, never exposed to the browser) which bypasses RLS.
-- ------------------------------------------------------------------
alter table guests enable row level security;
alter table reception_tables enable row level security;
alter table rsvps enable row level security;
