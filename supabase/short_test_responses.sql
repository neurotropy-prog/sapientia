-- Schema sapientia: aísla las tablas del test corto Neurobienestar.
-- Vive dentro del proyecto Supabase `flow` (compartido con otros usos de flow),
-- pero en un schema separado para evitar colisiones con `public`.
--
-- Aplicar en SQL Editor del proyecto flow.
-- IMPORTANTE: después de aplicar, exponer el schema `sapientia` en
--   Settings → Data API → Settings → Exposed schemas (añadir "sapientia").

create schema if not exists sapientia;

grant usage on schema sapientia to service_role, postgres, anon, authenticated;
alter default privileges in schema sapientia grant all on tables to service_role, postgres;
alter default privileges in schema sapientia grant all on sequences to service_role, postgres;

create table if not exists sapientia.short_test_responses (
  id              uuid primary key default gen_random_uuid(),
  whatsapp        text not null unique,        -- clave de identidad del lead
  email           text,                         -- opcional: viene del DB de leads del test largo si se conoce
  p1              text not null check (p1 in ('A','B','C','D','E')),
  p2              text not null check (p2 in ('A','B','C','D','E')),
  p3              text not null check (p3 in ('A','B','C','D','E')),
  p4              text not null check (p4 in ('A','B','C','D','E')),
  p5              text,
  bucket          text not null check (bucket in ('ansiedad','insomnio','fatiga','estres_cronico')),
  score_ansiedad  integer not null,
  score_insomnio  integer not null,
  score_fatiga    integer not null,
  score_estres    integer not null,
  secondary_buckets text[] default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_short_test_bucket   on sapientia.short_test_responses(bucket);
create index if not exists idx_short_test_created  on sapientia.short_test_responses(created_at desc);
create index if not exists idx_short_test_whatsapp on sapientia.short_test_responses(whatsapp);

-- Trigger updated_at
create or replace function sapientia.touch_short_test_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists trg_short_test_updated_at on sapientia.short_test_responses;
create trigger trg_short_test_updated_at
  before update on sapientia.short_test_responses
  for each row execute function sapientia.touch_short_test_updated_at();

-- RLS por defecto bloqueado: solo service_role del endpoint puede escribir.
alter table sapientia.short_test_responses enable row level security;
