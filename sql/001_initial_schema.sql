-- ============================================================================
-- 001_initial_schema.sql
-- Initial PostgreSQL Schema for Supabase Migration
-- Generated from Firestore Collections and TypeScript interfaces in src/types/
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCTS
-- Firestore Collection: 'products'
-- TypeScript Interface: EnrichedProduct (src/types/productStudio.ts) / Product (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists products (
  id text primary key,
  title text not null,
  brand text,
  model text,
  category_id text,
  category text,
  price numeric(12, 2) not null default 0,
  original_price numeric(12, 2),
  min_negotiation_price numeric(12, 2),
  is_negotiable boolean default false,
  condition text,
  status text not null default 'available',
  availability_status text default 'available',
  lifecycle_stage text default 'published',
  is_published boolean default true,
  is_archived boolean default false,
  is_featured boolean default false,
  showroom_location text,
  qr_code text,
  barcode text,
  views_count integer default 0,
  reservations_count integer default 0,
  purchase_requests_count integer default 0,
  negotiations_count integer default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id, price);
create index if not exists idx_products_status on products(status, created_at desc);
create index if not exists idx_products_lifecycle on products(lifecycle_stage, is_archived);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- Firestore Collection: 'categories'
-- TypeScript Interface: Category (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id text primary key,
  name text not null,
  arabic_name text,
  english_name text,
  slug text,
  seo_slug text,
  icon_name text,
  is_active boolean default true,
  sort_order integer default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_categories_active on categories(is_active, sort_order);

-- ----------------------------------------------------------------------------
-- 3. BRANDS
-- Firestore Collection: 'brands'
-- TypeScript Interface: Brand (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists brands (
  id text primary key,
  name text not null,
  arabic_name text,
  logo_url text,
  is_active boolean default true,
  sort_order integer default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_brands_active on brands(is_active, sort_order);

-- ----------------------------------------------------------------------------
-- 4. CUSTOMERS
-- Firestore Collection: 'customers'
-- TypeScript Interface: Customer (src/types/customerHub.ts / src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists customers (
  id text primary key,
  full_name text not null,
  primary_phone text not null,
  whatsapp_phone text,
  email text,
  status text default 'new',
  first_contact_date timestamptz,
  last_activity_date timestamptz,
  total_requests integer default 0,
  total_purchases integer default 0,
  total_reservations integer default 0,
  total_spent numeric(12, 2) default 0,
  assigned_admin text,
  firebase_uid text,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customers_phone on customers(primary_phone);
create index if not exists idx_customers_firebase_uid on customers(firebase_uid);
create index if not exists idx_customers_status on customers(status);

-- ----------------------------------------------------------------------------
-- 5. USERS
-- Firestore Collection: 'users'
-- TypeScript Interface: AdminUser (src/types/auth.ts)
-- ----------------------------------------------------------------------------
create table if not exists users (
  id text primary key,
  username text,
  email text not null,
  full_name text,
  role text default 'manager',
  is_two_factor_enabled boolean default false,
  last_login_at timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_email on users(email);

-- ----------------------------------------------------------------------------
-- 6. RESERVATIONS
-- Firestore Collection: 'reservations'
-- TypeScript Interface: Reservation (src/types/index.ts) / ReservationItem (src/types/orderManagementCenter.ts)
-- ----------------------------------------------------------------------------
create table if not exists reservations (
  id text primary key,
  reservation_number text,
  product_id text,
  customer_id text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  product_price numeric(12, 2),
  remaining_balance numeric(12, 2) default 0,
  duration_hours integer default 24,
  expires_at timestamptz,
  status text not null default 'Reserved',
  assigned_admin text,
  auto_release_enabled boolean default true,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reservations_phone on reservations(customer_phone, status);
create index if not exists idx_reservations_product on reservations(product_id);
create index if not exists idx_reservations_expires on reservations(expires_at);

-- ----------------------------------------------------------------------------
-- 7. ORDERS
-- Firestore Collection: 'orders'
-- TypeScript Interface: Order (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists orders (
  id text primary key,
  order_number text not null,
  customer_id text,
  customer_name text not null,
  phone text not null,
  total_amount numeric(12, 2) not null default 0,
  remaining_amount numeric(12, 2) default 0,
  payment_method text,
  status text not null default 'pending',
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_status on orders(status, created_at desc);
create index if not exists idx_orders_phone on orders(phone);

-- ----------------------------------------------------------------------------
-- 8. COMPLETED SALES
-- Firestore Collection: 'completed_sales'
-- TypeScript Interface: CompletedSaleItem (src/types/orderManagementCenter.ts)
-- ----------------------------------------------------------------------------
create table if not exists completed_sales (
  id text primary key,
  order_number text,
  customer_name text,
  customer_phone text,
  product_id text,
  product_title text,
  final_price numeric(12, 2),
  payment_method text,
  invoice_number text,
  completion_date timestamptz,
  delivery_type text,
  assigned_admin text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_completed_sales_date on completed_sales(completion_date desc);

-- ----------------------------------------------------------------------------
-- 9. EXCHANGE REQUESTS
-- Firestore Collection: 'exchange_requests'
-- TypeScript Interface: ExchangeRequest (src/types/index.ts) / ExchangeDeviceRequest (src/types/customerHub.ts)
-- ----------------------------------------------------------------------------
create table if not exists exchange_requests (
  id text primary key,
  request_number text,
  customer_name text not null,
  customer_phone text not null,
  customer_whatsapp text,
  current_appliance_type text,
  current_brand text,
  desired_product_id text,
  estimated_trade_value numeric(12, 2),
  cash_difference numeric(12, 2),
  status text not null default 'new',
  assigned_admin text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_exchange_requests_phone on exchange_requests(customer_phone);

-- ----------------------------------------------------------------------------
-- 10. SELL REQUESTS
-- Firestore Collection: 'sell_requests'
-- TypeScript Interface: SellRequest (src/types/index.ts) / SellDeviceRequest (src/types/customerHub.ts)
-- ----------------------------------------------------------------------------
create table if not exists sell_requests (
  id text primary key,
  request_number text,
  customer_name text not null,
  customer_phone text not null,
  customer_whatsapp text,
  appliance_type text,
  brand text,
  asking_price numeric(12, 2),
  offered_price numeric(12, 2),
  condition text,
  status text not null default 'new',
  assigned_admin text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_sell_requests_phone on sell_requests(customer_phone);

-- ----------------------------------------------------------------------------
-- 11. PURCHASE REQUESTS
-- Firestore Collection: 'purchase_requests'
-- TypeScript Interface: PurchaseRequest (src/types/orderManagementCenter.ts) / PurchaseRequestRecord (src/types/customerActions.ts)
-- ----------------------------------------------------------------------------
create table if not exists purchase_requests (
  id text primary key,
  reference_number text,
  customer_id text,
  customer_name text not null,
  customer_phone text not null,
  product_id text,
  product_title text,
  product_price numeric(12, 2),
  priority text default 'medium',
  status text not null default 'new',
  assigned_admin text,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_purchase_requests_phone on purchase_requests(customer_phone);
create index if not exists idx_purchase_requests_status on purchase_requests(status);

-- ----------------------------------------------------------------------------
-- 12. NEGOTIATIONS
-- Firestore Collection: 'negotiations'
-- TypeScript Interface: NegotiationItem (src/types/orderManagementCenter.ts) / NegotiationRequestRecord (src/types/customerActions.ts)
-- ----------------------------------------------------------------------------
create table if not exists negotiations (
  id text primary key,
  reference_number text,
  customer_name text not null,
  customer_phone text not null,
  product_id text,
  product_title text,
  original_price numeric(12, 2),
  suggested_price numeric(12, 2),
  discount_amount numeric(12, 2),
  discount_percent numeric(5, 2),
  status text not null default 'pending',
  assigned_admin text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_negotiations_phone on negotiations(customer_phone);
create index if not exists idx_negotiations_product on negotiations(product_id);

-- ----------------------------------------------------------------------------
-- 13. INQUIRIES
-- Firestore Collection: 'inquiries'
-- TypeScript Interface: InquiryItem (src/types/orderManagementCenter.ts) / InquiryRequestRecord (src/types/customerActions.ts)
-- ----------------------------------------------------------------------------
create table if not exists inquiries (
  id text primary key,
  reference_number text,
  customer_name text not null,
  customer_phone text not null,
  product_id text,
  product_title text,
  inquiry_message text,
  admin_response text,
  priority text default 'medium',
  status text not null default 'new',
  assigned_admin text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_inquiries_phone on inquiries(customer_phone);

-- ----------------------------------------------------------------------------
-- 14. SUPPLIERS
-- Firestore Collection: 'suppliers'
-- TypeScript Interface: SupplierRecord (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists suppliers (
  id text primary key,
  supplier_number text,
  name text not null,
  phone text,
  whatsapp text,
  area text,
  type text default 'individual',
  purchase_count integer default 0,
  total_spent numeric(12, 2) default 0,
  rating numeric(3, 1) default 5.0,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_suppliers_name on suppliers(name);

-- ----------------------------------------------------------------------------
-- 15. EXPENSES
-- Firestore Collection: 'expenses'
-- TypeScript Interface: ExpenseItem (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists expenses (
  id text primary key,
  reference_number text,
  category text not null,
  amount numeric(12, 2) not null,
  description text,
  related_product_id text,
  supplier_id text,
  created_by text,
  date timestamptz,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_expenses_category on expenses(category);
create index if not exists idx_expenses_date on expenses(date desc);

-- ----------------------------------------------------------------------------
-- 16. FINANCE
-- Firestore Collection: 'finance'
-- TypeScript Interface: FinancialTimelineEvent / AppliancePurchaseRecord (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists finance (
  id text primary key,
  reference_number text,
  type text,
  category text,
  amount numeric(12, 2),
  description text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_finance_type on finance(type);

-- ----------------------------------------------------------------------------
-- 17. COST SHEETS
-- Firestore Collection: 'cost_sheets'
-- TypeScript Interface: ProductCostSheet (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists cost_sheets (
  id text primary key,
  product_id text not null,
  product_title text,
  category text,
  purchase_cost numeric(12, 2) default 0,
  repair_cost numeric(12, 2) default 0,
  total_cost numeric(12, 2) default 0,
  target_selling_price numeric(12, 2) default 0,
  minimum_acceptable_price numeric(12, 2) default 0,
  target_profit_margin_percent numeric(5, 2) default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cost_sheets_product on cost_sheets(product_id);

-- ----------------------------------------------------------------------------
-- 18. INVOICES
-- Firestore Collection: 'invoices'
-- TypeScript Interface: Invoice (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists invoices (
  id text primary key,
  invoice_number text not null,
  customer_name text not null,
  customer_phone text not null,
  subtotal numeric(12, 2) default 0,
  tax_amount numeric(12, 2) default 0,
  discount_amount numeric(12, 2) default 0,
  total_amount numeric(12, 2) not null default 0,
  payment_status text default 'unpaid',
  issue_date timestamptz,
  due_date timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_invoices_number on invoices(invoice_number);
create index if not exists idx_invoices_phone on invoices(customer_phone);

-- ----------------------------------------------------------------------------
-- 19. CASH LEDGERS
-- Firestore Collection: 'cash_ledgers'
-- TypeScript Interface: CashLedgerEntry (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists cash_ledgers (
  id text primary key,
  reference_number text,
  type text not null, -- money_in / money_out
  category text,
  amount numeric(12, 2) not null,
  description text,
  running_balance numeric(12, 2),
  created_by text,
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cash_ledgers_created on cash_ledgers(created_at desc);

-- ----------------------------------------------------------------------------
-- 20. AUDIT LOGS
-- Firestore Collection: 'audit_logs'
-- TypeScript Interface: AuditLogEvent (src/types/adminOperations.ts) / ActivityLogEntry (src/types/adminCore.ts)
-- ----------------------------------------------------------------------------
create table if not exists audit_logs (
  id text primary key,
  action text not null,
  actor text,
  actor_role text,
  target text,
  category text,
  status text default 'success',
  severity text default 'info',
  ip_address text,
  device text,
  description text,
  timestamp timestamptz default now(),
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_audit_logs_timestamp on audit_logs(timestamp desc, action);

-- ----------------------------------------------------------------------------
-- 21. SHOWROOM SETTINGS
-- Firestore Collection: 'showroom_settings'
-- TypeScript Interface: ShowroomSettings (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists showroom_settings (
  id text primary key,
  name text,
  brand_tagline text,
  email text,
  phone text,
  whatsapp_phone text,
  enable_ai_assistant boolean default true,
  currency_symbol text default 'ج.م',
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 22. DOCUMENTS
-- Firestore Collection: 'documents'
-- TypeScript Interface: CustomerDocument (src/types/customerHub.ts / src/types/customerActions.ts)
-- ----------------------------------------------------------------------------
create table if not exists documents (
  id text primary key,
  document_number text,
  type text not null,
  title text not null,
  reference_number text,
  customer_name text,
  customer_phone text,
  product_title text,
  product_price numeric(12, 2),
  remaining_amount numeric(12, 2),
  issue_date timestamptz,
  status text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_documents_phone on documents(customer_phone);

-- ----------------------------------------------------------------------------
-- 23. ADMINS
-- Firestore Collection: 'admins'
-- TypeScript Interface: AdminUser (src/types/auth.ts)
-- ----------------------------------------------------------------------------
create table if not exists admins (
  id text primary key,
  email text not null,
  username text,
  full_name text,
  role text default 'manager',
  is_active boolean default true,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_admins_email on admins(email);

-- ----------------------------------------------------------------------------
-- 24. INVENTORY
-- Firestore Collection: 'inventory'
-- TypeScript Interface: ProcurementItem (src/types/adminFinance.ts)
-- ----------------------------------------------------------------------------
create table if not exists inventory (
  id text primary key,
  reference_number text,
  appliance_type text,
  brand text,
  target_purchase_price numeric(12, 2),
  maximum_purchase_price numeric(12, 2),
  priority text default 'medium',
  status text default 'open',
  is_archived boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_inventory_status on inventory(status);

-- ----------------------------------------------------------------------------
-- 25. REPORTS
-- Firestore Collection: 'reports'
-- TypeScript Interface: Reports/Analytics Snapshots (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists reports (
  id text primary key,
  title text,
  report_type text,
  generated_by text,
  period_start timestamptz,
  period_end timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 26. ANALYTICS
-- Firestore Collection: 'analytics'
-- TypeScript Interface: AnalyticsSummary / ProductAnalytics (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists analytics (
  id text primary key,
  metric_key text,
  category text,
  value numeric(14, 2),
  date date,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_analytics_key on analytics(metric_key, date);

-- ----------------------------------------------------------------------------
-- 27. PORTAL TRACKING
-- Firestore Collection: 'portal_tracking'
-- TypeScript Interface: TrackingMapEntry (src/types/customerPortal.ts)
-- ----------------------------------------------------------------------------
create table if not exists portal_tracking (
  id text primary key,
  tracking_code text not null,
  phone text not null,
  reference_number text not null,
  is_invalidated boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_portal_tracking_code on portal_tracking(tracking_code);
create index if not exists idx_portal_tracking_phone on portal_tracking(phone);

-- ----------------------------------------------------------------------------
-- 28. PORTAL SESSIONS
-- Firestore Collection: 'portal_sessions'
-- TypeScript Interface: CustomerPortalSession (src/types/customerPortal.ts)
-- ----------------------------------------------------------------------------
create table if not exists portal_sessions (
  id text primary key,
  phone_number text not null,
  normalized_phone text not null,
  customer_name text,
  auth_method text default 'tracking_code',
  authenticated_at timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_portal_sessions_phone on portal_sessions(normalized_phone);

-- ----------------------------------------------------------------------------
-- 29. PORTAL SUPPORT
-- Firestore Collection: 'portal_support'
-- TypeScript Interface: PortalSupportMessage (src/types/customerPortal.ts)
-- ----------------------------------------------------------------------------
create table if not exists portal_support (
  id text primary key,
  thread_id text not null,
  sender text not null,
  sender_name text,
  message text not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_portal_support_thread on portal_support(thread_id, created_at asc);

-- ----------------------------------------------------------------------------
-- 30. AUTH SESSIONS
-- Firestore Collection: 'auth_sessions'
-- TypeScript Interface: AuthSession (src/types/auth.ts)
-- ----------------------------------------------------------------------------
create table if not exists auth_sessions (
  id text primary key,
  token text not null,
  user_id text,
  expires_at timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_auth_sessions_token on auth_sessions(token);

-- ----------------------------------------------------------------------------
-- 31. AUTH ATTEMPTS
-- Firestore Collection: 'auth_attempts'
-- TypeScript Interface: LoginAttemptRecord (src/types/auth.ts) / FailedLoginAttempt (src/types/adminCore.ts)
-- ----------------------------------------------------------------------------
create table if not exists auth_attempts (
  id text primary key,
  ip text not null,
  email text,
  attempts_count integer default 1,
  is_locked_until timestamptz,
  last_failed_at timestamptz,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_auth_attempts_ip on auth_attempts(ip);

-- ----------------------------------------------------------------------------
-- 32. AUTH LOGS
-- Firestore Collection: 'auth_logs'
-- TypeScript Interface: ActivityLog (src/types/auth.ts)
-- ----------------------------------------------------------------------------
create table if not exists auth_logs (
  id text primary key,
  user_id text,
  user_name text,
  action text not null,
  category text default 'auth',
  status text default 'success',
  ip_address text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_auth_logs_created on auth_logs(created_at desc);

-- ----------------------------------------------------------------------------
-- 33. NOTIFICATIONS
-- Firestore Collection: 'notifications'
-- TypeScript Interface: AdminNotification (src/types/adminCore.ts) / PortalNotification (src/types/customerPortal.ts)
-- ----------------------------------------------------------------------------
create table if not exists notifications (
  id text primary key,
  type text not null,
  title text not null,
  message text not null,
  reference_number text,
  priority text default 'medium',
  state text default 'unread',
  is_read boolean default false,
  user_id text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_notifications_user on notifications(user_id, state);

-- ----------------------------------------------------------------------------
-- 34. REVIEWS
-- Firestore Collection: 'reviews'
-- TypeScript Interface: Review (src/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists reviews (
  id text primary key,
  customer_name text not null,
  rating integer not null default 5,
  comment text not null,
  approved boolean default false,
  location text,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reviews_approved on reviews(approved, created_at desc);

-- ----------------------------------------------------------------------------
-- 35. AI KNOWLEDGE
-- Firestore Collection: 'ai_knowledge'
-- TypeScript Interface: BusinessRuleDefinition / AiMemoryRecord (src/types/aiKnowledgeEngine.ts)
-- ----------------------------------------------------------------------------
create table if not exists ai_knowledge (
  id text primary key,
  rule_code text,
  category text,
  title text,
  enforced boolean default true,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ai_knowledge_category on ai_knowledge(category, rule_code);
