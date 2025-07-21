-- View exposing table names in the public schema
create or replace view public.available_tables as
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE';

-- View exposing column names for public tables
create or replace view public.available_columns as
select table_name, column_name
from information_schema.columns
where table_schema = 'public';

-- Optional table for storing system status metrics
create table if not exists public.system_status (
  id serial primary key,
  name text,
  status text,
  timestamp timestamptz default now()
);
