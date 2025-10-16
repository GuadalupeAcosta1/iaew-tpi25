create extension if not exists "uuid-ossp";

create table if not exists vehiculo (
  id uuid primary key default uuid_generate_v4(),
  patente text unique not null,
  marca text not null,
  modelo text not null,
  anio int not null check (anio >= 1990),
  estado text not null check (estado in ('disponible','mantenimiento','bloqueado')),
  created_at timestamptz not null default now()
);

create table if not exists reserva (
  id uuid primary key default uuid_generate_v4(),
  vehiculo_id uuid not null references vehiculo(id),
  cliente_id uuid not null,
  desde timestamptz not null,
  hasta timestamptz not null,
  estado text not null check (estado in ('pendiente','verificacion_pendiente','confirmada','rechazada','cancelada')),
  contrato_url text,
  bloque_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reserva_vehiculo_rango on reserva(vehiculo_id, desde, hasta);

create table if not exists outbox_event (
  id bigserial primary key,
  aggregate_id uuid not null,
  type text not null,
  payload jsonb not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
