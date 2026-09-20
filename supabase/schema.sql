-- =========================================================
-- WhatsApp AI Sales Agent — Supabase schema
-- Run this once in the Supabase SQL editor (or via the CLI)
-- against a fresh project.
-- =========================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- =========================================================
-- business_config: singleton configuration row (id is always 1)
-- =========================================================
create table if not exists business_config (
  id integer primary key default 1,
  business_name text not null default 'My Business',
  system_prompt text not null default 'You are a helpful assistant for our business. Be concise and friendly.',
  tone text not null default 'friendly',
  ai_model text not null default 'gpt-4o',
  context_window integer not null default 10,
  updated_at timestamptz not null default now(),
  constraint business_config_singleton check (id = 1)
);

insert into business_config (id) values (1)
  on conflict (id) do nothing;

-- Added after the initial release: which dashboard UI preset staff have chosen
-- (boba-green | milk-tea | classic-slate). `add column if not exists` makes
-- this safe to re-run against a project that already has business_config.
alter table business_config add column if not exists ui_theme text not null default 'boba-green';

-- =========================================================
-- conversations
-- =========================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  wa_id text not null unique,
  contact_name text,
  status text not null default 'open',
  ai_enabled boolean not null default true,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_conversations_wa_id on conversations (wa_id);
create index if not exists idx_conversations_last_message_at on conversations (last_message_at desc);

-- =========================================================
-- messages
-- =========================================================
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  wa_message_id text unique,
  role text not null check (role in ('user', 'assistant', 'human')),
  content text not null,
  message_type text not null default 'text',
  delivered boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_id on messages (conversation_id);
create index if not exists idx_messages_conversation_created on messages (conversation_id, created_at desc);
create index if not exists idx_messages_wa_message_id on messages (wa_message_id);

-- =========================================================
-- Row Level Security
--
-- The webhook and API routes use the service role key, which bypasses
-- RLS entirely. These policies only govern access from the browser
-- (anon key + a logged-in Supabase Auth session), i.e. the dashboard.
-- This is an internal single-business tool, so any authenticated user
-- is treated as trusted staff with full read/write access.
-- =========================================================
alter table conversations enable row level security;
alter table messages enable row level security;
alter table business_config enable row level security;

create policy "authenticated users can read conversations"
  on conversations for select
  to authenticated
  using (true);

create policy "authenticated users can update conversations"
  on conversations for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can read messages"
  on messages for select
  to authenticated
  using (true);

create policy "authenticated users can insert messages"
  on messages for insert
  to authenticated
  with check (true);

create policy "authenticated users can read business_config"
  on business_config for select
  to authenticated
  using (true);

create policy "authenticated users can update business_config"
  on business_config for update
  to authenticated
  using (true)
  with check (true);

-- =========================================================
-- Realtime: let the dashboard subscribe to live inserts/updates
-- =========================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table conversations;

-- =========================================================
-- updated_at trigger for business_config
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_business_config_updated_at on business_config;
create trigger trg_business_config_updated_at
  before update on business_config
  for each row execute function set_updated_at();
