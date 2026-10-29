-- ============================================================================
-- 003_customer_requests_table.sql
-- Unified Customer Requests Table for Supabase Migration
-- Mirrors UnifiedCustomerRequest interface in src/core/repositories/RequestRepository.ts
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CUSTOMER_REQUESTS
-- Firestore Collection: 'customer_requests'
-- TypeScript Interface: UnifiedCustomerRequest (src/core/repositories/RequestRepository.ts)
-- ----------------------------------------------------------------------------
create table if not exists customer_requests (
  id text primary key,
  reference_number text,
  type text not null default 'purchase',
  customer jsonb not null default '{}'::jsonb,
  product_id text,
  product_title text,
  product_price numeric(12, 2),
  final_price numeric(12, 2),
  product_image text,
  status text not null default 'new',
  priority text default 'medium',
  details jsonb default '{}'::jsonb,
  audit_trail jsonb default '[]'::jsonb,
  internal_notes text,
  admin_notes text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Performance Indexes
create index if not exists idx_customer_requests_type on customer_requests(type);
create index if not exists idx_customer_requests_status on customer_requests(status, created_at desc);
create index if not exists idx_customer_requests_ref on customer_requests(reference_number);
create index if not exists idx_customer_requests_created on customer_requests(created_at desc);
create index if not exists idx_customer_requests_customer on customer_requests using gin (customer);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ----------------------------------------------------------------------------
alter table customer_requests enable row level security;

-- Policy 1: Service role (Admin SDK with elevated secret key) has unrestricted access
drop policy if exists "Service role full access on customer_requests" on customer_requests;
create policy "Service role full access on customer_requests"
  on customer_requests
  for all
  using (true)
  with check (true);

-- Policy 2: Public insert allows customer interactions from frontend showroom
drop policy if exists "Public insert on customer_requests" on customer_requests;
create policy "Public insert on customer_requests"
  on customer_requests
  for insert
  with check (true);

-- Policy 3: Public select allows tracking requests via tracking code/phone
drop policy if exists "Public select on customer_requests" on customer_requests;
create policy "Public select on customer_requests"
  on customer_requests
  for select
  using (true);

-- ----------------------------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table customer_requests;
  end if;
end $$;
