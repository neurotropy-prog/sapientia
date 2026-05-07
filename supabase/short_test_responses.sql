-- Tabla para almacenar respuestas del test corto Neurobienestar.
-- Idempotente por email (un lead, una fila — la última actualización gana).
--
-- Aplicar con:  supabase db push  (o pegando en el SQL Editor del proyecto)

create table if not exists public.short_test_responses (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
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

create index if not exists idx_short_test_bucket on public.short_test_responses(bucket);
create index if not exists idx_short_test_created on public.short_test_responses(created_at desc);

-- Trigger de updated_at
create or replace function public.touch_short_test_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_short_test_updated_at on public.short_test_responses;
create trigger trg_short_test_updated_at
  before update on public.short_test_responses
  for each row
  execute function public.touch_short_test_updated_at();

-- RLS: solo service role puede leer/escribir desde el endpoint.
-- Si quieres habilitar lectura pública (p.ej. para /admin), añade políticas adicionales.
alter table public.short_test_responses enable row level security;
