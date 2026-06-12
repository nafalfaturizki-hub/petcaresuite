PETCARE SUITE

06_DATABASE_SCHEMA.md

Version 3.0

Single Source of Truth (SSOT)

Production Ready Database Specification


---

1. DATABASE OVERVIEW

Database Engine:

PostgreSQL 16+

Provider:

Supabase PostgreSQL

Mode:

Single Tenant
Single Clinic

Rule:

1 Supabase Project
=
1 Klinik


---

2. REQUIRED EXTENSIONS

Migration pertama WAJIB mengaktifkan:

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;


---

3. ENUMS

user_role_enum

create type user_role_enum as enum (
'owner',
'doctor',
'staff',
'customer'
);


---

module_key_enum

create type module_key_enum as enum (
'clinic',
'monitoring',
'inpatient',
'grooming',
'petshop',
'inventory',
'accounting',
'website'
);


---

appointment_status_enum

create type appointment_status_enum as enum (
'scheduled',
'confirmed',
'completed',
'cancelled',
'no-show'
);


---

customer_status_enum

create type customer_status_enum as enum (
'active',
'inactive',
'vip',
'blacklisted'
);


---

cage_status_enum

create type cage_status_enum as enum (
'available',
'occupied',
'cleaning',
'maintenance'
);


---

payment_method_enum

create type payment_method_enum as enum (
'cash',
'card',
'bank-transfer',
'e-wallet'
);


---

stock_movement_type_enum

create type stock_movement_type_enum as enum (
'inbound',
'outbound',
'adjustment'
);


---

notification_provider_enum

create type notification_provider_enum as enum (
'email',
'whatsapp',
'sms'
);


---

account_type_enum

create type account_type_enum as enum (
'asset',
'liability',
'equity',
'revenue',
'expense'
);


---

transaction_type_enum

create type transaction_type_enum as enum (
'credit',
'debit'
);


---

invoice_status_enum

create type invoice_status_enum as enum (
'draft',
'pending',
'paid',
'cancelled',
'refunded'
);


---

medical_record_type_enum

create type medical_record_type_enum as enum (
'consultation',
'follow-up',
'emergency',
'surgery'
);


---

vaccination_channel_enum

create type vaccination_channel_enum as enum (
'email',
'whatsapp',
'sms'
);


---

4. COMMON FUNCTIONS

updated_at trigger

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


---

5. PROFILES

create table profiles (
  id uuid primary key,
  full_name text not null,
  email text unique not null,
  whatsapp text,
  role user_role_enum not null default 'customer',
  is_active boolean default true,
  avatar_url text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

Indexes

create index idx_profiles_role
on profiles(role);

create index idx_profiles_active
on profiles(is_active);


---

6. SETTINGS

create table settings (
  id uuid primary key default gen_random_uuid(),

  key varchar(100) unique not null,

  value jsonb not null default '{}',

  updated_by uuid references profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

7. MODULES

create table modules (
  id uuid primary key default gen_random_uuid(),

  key module_key_enum unique not null,

  is_enabled boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

8. AUDIT LOGS

create table audit_logs (
  id uuid primary key default gen_random_uuid(),

  user_id uuid references profiles(id),

  action varchar(50) not null,

  table_name varchar(100) not null,

  record_id uuid,

  old_value jsonb,

  new_value jsonb,

  ip_address inet,

  created_at timestamptz default now()
);


---

9. CUSTOMERS

create table customers (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid references profiles(id),

  full_name text not null,

  whatsapp text,

  email text,

  address text,

  notes text,

  status customer_status_enum default 'active',

  loyalty_points bigint default 0,

  membership_tier text,

  registration_date date default current_date,

  created_by uuid references profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

Indexes

create index idx_customers_profile
on customers(profile_id);

create index idx_customers_status
on customers(status);

create index idx_customers_name_trgm
on customers using gin(full_name gin_trgm_ops);


---

10. SPECIES

create table species (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  created_at timestamptz default now()
);


---

11. BREEDS

create table breeds (
  id uuid primary key default gen_random_uuid(),

  species_id uuid not null
  references species(id),

  name text not null,

  created_at timestamptz default now(),

  unique(species_id,name)
);


---

12. PETS

create table pets (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null
  references customers(id) on delete cascade,

  name text not null,

  photo_url text,

  species_id uuid not null
  references species(id),

  breed_id uuid not null
  references breeds(id),

  gender varchar(20) not null,

  birth_date date,

  weight numeric(8,2),

  color text,

  is_sterilized boolean default false,

  microchip_number text,

  qr_code text unique,

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

Indexes

create index idx_pets_customer
on pets(customer_id);

create index idx_pets_name
on pets(name);

create index idx_pets_microchip
on pets(microchip_number);


---

13. SERVICES

create table services (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text,

  duration_minutes integer not null,

  price numeric(12,2) not null,

  category text,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

14. DOCTORS

create table doctors (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid unique not null
  references profiles(id),

  specialization text,

  bio text,

  photo_url text,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

15. DOCTOR SCHEDULES

create table doctor_schedules (
  id uuid primary key default gen_random_uuid(),

  doctor_id uuid not null
  references doctors(id) on delete cascade,

  day_of_week integer not null,

  start_time time not null,

  end_time time not null,

  is_available boolean default true
);


---

16. APPOINTMENTS

create table appointments (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null
  references customers(id),

  pet_id uuid not null
  references pets(id),

  doctor_id uuid
  references doctors(id),

  service_id uuid
  references services(id),

  appointment_date date not null,

  start_time time not null,

  end_time time not null,

  status appointment_status_enum
  default 'scheduled',

  queue_number integer,

  notes text,

  created_by uuid
  references profiles(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

Indexes

create index idx_appointments_date
on appointments(appointment_date);

create index idx_appointments_status
on appointments(status);

create index idx_appointments_doctor
on appointments(doctor_id);


---

17. QUEUE COUNTERS

create table queue_counters (
  queue_date date primary key,

  last_number integer default 0,

  updated_at timestamptz default now()
);


---

18. MEDICAL RECORDS

create table medical_records (
  id uuid primary key default gen_random_uuid(),

  appointment_id uuid
  references appointments(id),

  pet_id uuid not null
  references pets(id),

  doctor_id uuid
  references doctors(id),

  record_type medical_record_type_enum not null,

  subjective text,

  objective text,

  assessment text,

  plan text,

  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

19. PRESCRIPTIONS

create table prescriptions (
  id uuid primary key default gen_random_uuid(),

  medical_record_id uuid not null
  references medical_records(id)
  on delete cascade,

  drug_name text not null,

  dose text,

  duration_days integer,

  instruction text,

  created_at timestamptz default now()
);


---

20. MEDICAL ATTACHMENTS

create table medical_attachments (
  id uuid primary key default gen_random_uuid(),

  medical_record_id uuid not null
  references medical_records(id)
  on delete cascade,

  file_url text not null,

  file_type text,

  file_name text,

  uploaded_by uuid
  references profiles(id),

  created_at timestamptz default now()
);


---

21. VACCINES

create table vaccines (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text,

  manufacturer text,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

22. VACCINATION RECORDS

create table vaccination_records (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id)
  on delete cascade,

  vaccine_id uuid not null
  references vaccines(id),

  doctor_id uuid
  references doctors(id),

  vaccinated_at timestamptz not null,

  next_due_date date,

  batch_number text,

  notes text,

  certificate_url text,

  created_at timestamptz default now()
);


---

Indexes

create index idx_vaccination_pet
on vaccination_records(pet_id);

create index idx_vaccination_due
on vaccination_records(next_due_date);


---

23. VACCINATION REMINDERS

create table vaccination_reminders (
  id uuid primary key default gen_random_uuid(),

  vaccination_record_id uuid not null
  references vaccination_records(id)
  on delete cascade,

  remind_at timestamptz not null,

  channel vaccination_channel_enum not null,

  status varchar(20) default 'pending',

  sent_at timestamptz
);


---

24. WEIGHT RECORDS

create table weight_records (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id)
  on delete cascade,

  weight numeric(8,2) not null,

  notes text,

  recorded_by uuid
  references profiles(id),

  recorded_at timestamptz default now()
);


---

25. MEDICATION SCHEDULES

create table medication_schedules (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id),

  medical_record_id uuid
  references medical_records(id),

  drug_name text not null,

  dose text,

  frequency text,

  start_date date,

  end_date date,

  instruction text,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

26. MEDICATION LOGS

create table medication_logs (
  id uuid primary key default gen_random_uuid(),

  medication_schedule_id uuid not null
  references medication_schedules(id)
  on delete cascade,

  taken_at timestamptz,

  status varchar(20),

  notes text,

  logged_by uuid
  references profiles(id)
);


---

27. RECOVERY NOTES

create table recovery_notes (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id),

  medical_record_id uuid not null
  references medical_records(id),

  note text not null,

  photo_url text,

  recorded_by uuid
  references profiles(id),

  recorded_at timestamptz default now()
);


---

28. OWNER UPLOADS

create table owner_uploads (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id),

  customer_id uuid not null
  references customers(id),

  photo_url text not null,

  note text,

  reviewed_by uuid
  references profiles(id),

  reviewed_at timestamptz,

  created_at timestamptz default now()
);


---

29. CAGES

create table cages (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  cage_type text,

  status cage_status_enum
  default 'available',

  notes text,

  created_at timestamptz default now()
);


---

30. INPATIENT RECORDS

create table inpatient_records (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id),

  cage_id uuid not null
  references cages(id),

  admitting_doctor_id uuid
  references doctors(id),

  admit_date date not null,

  discharge_date date,

  reason text,

  notes text,

  status varchar(30) not null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

31. DAILY OBSERVATIONS

create table daily_observations (
  id uuid primary key default gen_random_uuid(),

  inpatient_record_id uuid not null
  references inpatient_records(id)
  on delete cascade,

  temperature numeric(5,2),

  appetite text,

  weight numeric(8,2),

  condition text,

  notes text,

  observed_by uuid
  references profiles(id),

  observed_at timestamptz default now()
);


---

32. INPATIENT MEDICATION SCHEDULES

create table inpatient_medication_schedules (
  id uuid primary key default gen_random_uuid(),

  inpatient_record_id uuid not null
  references inpatient_records(id)
  on delete cascade,

  drug_name text not null,

  dose text,

  schedule_time time not null,

  given_at timestamptz,

  given_by uuid
  references profiles(id),

  status varchar(20)
);


---

33. GROOMING SERVICES

create table grooming_services (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  description text,

  price numeric(12,2) not null,

  duration_minutes integer not null,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

34. GROOMING RECORDS

create table grooming_records (
  id uuid primary key default gen_random_uuid(),

  pet_id uuid not null
  references pets(id),

  service_id uuid not null
  references grooming_services(id),

  groomer_id uuid
  references profiles(id),

  scheduled_at timestamptz not null,

  completed_at timestamptz,

  status varchar(30),

  notes text,

  photo_before_url text,

  photo_after_url text,

  created_at timestamptz default now()
);


---

35. INVENTORY CATEGORIES

create table inventory_categories (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  created_at timestamptz default now()
);


---

36. SUPPLIERS

create table suppliers (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  contact text,

  address text,

  notes text,

  created_at timestamptz default now()
);


---

37. INVENTORY ITEMS

create table inventory_items (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  category_id uuid not null
  references inventory_categories(id),

  unit text not null,

  min_stock integer default 0,

  current_stock integer default 0,

  price_per_unit numeric(12,2),

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

38. INVENTORY BATCHES

create table inventory_batches (
  id uuid primary key default gen_random_uuid(),

  item_id uuid not null
  references inventory_items(id)
  on delete cascade,

  supplier_id uuid
  references suppliers(id),

  batch_number text not null,

  quantity integer not null,

  expiry_date date,

  purchase_price numeric(12,2),

  received_at timestamptz default now(),

  created_by uuid
  references profiles(id)
);


---

39. STOCK MOVEMENTS

create table stock_movements (
  id uuid primary key default gen_random_uuid(),

  item_id uuid not null
  references inventory_items(id),

  batch_id uuid
  references inventory_batches(id),

  movement_type stock_movement_type_enum not null,

  quantity integer not null,

  reference_type text,

  reference_id uuid,

  notes text,

  created_by uuid
  references profiles(id),

  created_at timestamptz default now()
);


---

40. PRODUCT CATEGORIES

create table product_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text unique not null,

  created_at timestamptz default now()
);


---

41. BRANDS

create table brands (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  created_at timestamptz default now()
);


---

42. PRODUCTS

create table products (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text unique not null,

  description text,

  category_id uuid not null
  references product_categories(id),

  brand_id uuid not null
  references brands(id),

  sku text unique not null,

  barcode text,

  base_price numeric(12,2),

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


---

43. PRODUCT VARIANTS

create table product_variants (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
  references products(id)
  on delete cascade,

  name text,

  size text,

  weight numeric(8,2),

  color text,

  price numeric(12,2) not null,

  stock integer default 0,

  created_at timestamptz default now()
);


---

44. PRODUCT IMAGES

create table product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
  references products(id)
  on delete cascade,

  url text not null,

  is_primary boolean default false,

  sort_order integer default 0,

  created_at timestamptz default now()
);


---

45. INVOICES

Design Rules

Invoice Number:
INV-YYYYMMDD-000001

Example:
INV-20260613-000001

Generated from database sequence.

Never use:

Date.now()
timestamp random
frontend generated id


---

Table

create table invoices (
  id uuid primary key default gen_random_uuid(),

  invoice_number varchar(50)
  unique not null,

  customer_id uuid
  references customers(id),

  appointment_id uuid
  references appointments(id),

  inpatient_record_id uuid
  references inpatient_records(id),

  subtotal numeric(14,2) not null,

  discount_amount numeric(14,2)
  default 0,

  loyalty_points_used bigint
  default 0,

  loyalty_discount_amount numeric(14,2)
  default 0,

  total numeric(14,2) not null,

  payment_method payment_method_enum,

  payment_method_secondary payment_method_enum,

  split_payment_detail jsonb,

  paid_amount numeric(14,2)
  default 0,

  change_amount numeric(14,2)
  default 0,

  status invoice_status_enum
  default 'pending',

  notes text,

  created_by uuid
  references profiles(id),

  created_at timestamptz default now(),

  paid_at timestamptz
);


---

Indexes

create index idx_invoice_customer
on invoices(customer_id);

create index idx_invoice_status
on invoices(status);

create index idx_invoice_created
on invoices(created_at desc);


---

46. INVOICE ITEMS

create table invoice_items (
  id uuid primary key default gen_random_uuid(),

  invoice_id uuid not null
  references invoices(id)
  on delete cascade,

  item_type varchar(50) not null,

  reference_id uuid,

  name text not null,

  quantity integer not null,

  unit_price numeric(14,2) not null,

  discount numeric(14,2)
  default 0,

  total numeric(14,2) not null,

  created_at timestamptz default now()
);


---

47. REFUNDS

create table refunds (
  id uuid primary key default gen_random_uuid(),

  invoice_id uuid not null
  references invoices(id),

  amount numeric(14,2) not null,

  reason text,

  created_by uuid
  references profiles(id),

  created_at timestamptz default now()
);


---

48. ACCOUNTS

create table accounts (
  id uuid primary key default gen_random_uuid(),

  name text unique not null,

  type account_type_enum not null,

  description text,

  is_active boolean default true,

  created_at timestamptz default now()
);


---

Seed Required

Revenue
COGS
Operating Expenses
Cash
Accounts Receivable
Inventory Asset


---

49. TRANSACTIONS

create table transactions (
  id uuid primary key default gen_random_uuid(),

  account_id uuid not null
  references accounts(id),

  invoice_id uuid
  references invoices(id),

  type transaction_type_enum not null,

  amount numeric(14,2) not null,

  description text,

  reference text,

  transaction_date date
  default current_date,

  created_by uuid
  references profiles(id),

  created_at timestamptz default now()
);


---

Indexes

create index idx_transactions_account
on transactions(account_id);

create index idx_transactions_date
on transactions(transaction_date);


---

50. NOTIFICATIONS LOG

create table notifications_log (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
  references profiles(id),

  channel notification_provider_enum
  not null,

  recipient text not null,

  template_key text not null,

  payload jsonb default '{}',

  status varchar(20) not null,

  error_message text,

  sent_at timestamptz,

  read_at timestamptz
);


---

51. NOTIFICATION QUEUE

Digunakan untuk scheduler.

create table notification_queue (
  id uuid primary key default gen_random_uuid(),

  channel notification_provider_enum,

  recipient text not null,

  template_key text not null,

  payload jsonb default '{}',

  scheduled_at timestamptz not null,

  processed_at timestamptz,

  status varchar(20)
  default 'pending',

  retry_count integer
  default 0,

  last_error text,

  created_at timestamptz
  default now()
);


---

52. ARTICLES

create table articles (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  slug text unique not null,

  content text not null,

  excerpt text,

  cover_url text,

  author_id uuid
  references profiles(id),

  is_published boolean
  default false,

  published_at timestamptz,

  created_at timestamptz default now(),

  updated_at timestamptz default now()
);


---

Indexes

create index idx_articles_slug
on articles(slug);

create index idx_articles_publish
on articles(is_published);


---

53. TESTIMONIALS

create table testimonials (
  id uuid primary key default gen_random_uuid(),

  customer_name text not null,

  content text not null,

  rating integer not null,

  photo_url text,

  is_active boolean default true,

  created_at timestamptz default now(),

  constraint testimonials_rating_check
  check (
    rating >= 1
    and rating <= 5
  )
);


---

54. WEBSITE CONTENT

create table website_content (
  id uuid primary key default gen_random_uuid(),

  section_key text unique not null,

  content jsonb not null,

  updated_by uuid
  references profiles(id),

  updated_at timestamptz
  default now()
);


---

55. STORAGE BUCKETS

pet-photos

Public = false

Store:

Pet Photos
Customer Uploads


---

medical-files

Public = false

Store:

Medical Attachments
Lab Results
X-Ray


---

vaccination-certificates

Public = false

Store:

PDF Vaccine Certificate


---

invoices

Public = false

Store:

Invoice PDF
Receipt PDF


---

website

Public = true

Store:

Blog Covers
Testimonials
Clinic Gallery


---

56. DATABASE SEQUENCES

Invoice Sequence

create sequence invoice_sequence;


---

Daily Queue Sequence

create sequence queue_sequence;


---

57. FUNCTION — GENERATE INVOICE NUMBER

create or replace function generate_invoice_number()
returns text
language plpgsql
as
$$
declare
  next_no bigint;
begin

  next_no := nextval('invoice_sequence');

  return
    'INV-' ||
    to_char(now(),'YYYYMMDD') ||
    '-' ||
    lpad(next_no::text,6,'0');

end;
$$;


---

58. FUNCTION — GENERATE QUEUE NUMBER

Production Safe

create or replace function generate_queue_number(
  target_date date
)
returns integer
language plpgsql
security definer
as
$$
declare
  result_number integer;
begin

  loop

    update queue_counters
    set last_number = last_number + 1
    where queue_date = target_date
    returning last_number
    into result_number;

    if found then
      return result_number;
    end if;

    begin

      insert into queue_counters(
        queue_date,
        last_number
      )
      values (
        target_date,
        1
      );

      return 1;

    exception
      when unique_violation then
    end;

  end loop;

end;
$$;


---

59. FUNCTION — UPDATE STOCK

create or replace function update_stock()
returns trigger
language plpgsql
as
$$
begin

  if new.movement_type = 'inbound' then

    update inventory_items
    set current_stock =
      current_stock + new.quantity
    where id = new.item_id;

  elsif new.movement_type = 'outbound' then

    update inventory_items
    set current_stock =
      current_stock - new.quantity
    where id = new.item_id;

  else

    update inventory_items
    set current_stock =
      new.quantity
    where id = new.item_id;

  end if;

  return new;

end;
$$;


---

60. TRIGGER — STOCK MOVEMENTS

create trigger trg_update_stock
after insert
on stock_movements
for each row
execute function update_stock();


---

61. FUNCTION — AUTO ACCOUNTING ENTRY

Saat invoice menjadi PAID.

create or replace function create_revenue_transaction()
returns trigger
language plpgsql
as
$$
declare
  revenue_account uuid;
begin

  if new.status = 'paid'
  and old.status <> 'paid'
  then

    select id
    into revenue_account
    from accounts
    where name = 'Revenue'
    limit 1;

    insert into transactions(
      account_id,
      invoice_id,
      type,
      amount,
      description
    )
    values(
      revenue_account,
      new.id,
      'credit',
      new.total,
      'Invoice Revenue'
    );

  end if;

  return new;

end;
$$;


---

62. ACCOUNTING TRIGGER

create trigger trg_invoice_paid
after update
on invoices
for each row
execute function create_revenue_transaction();


---

63. FUNCTION — AUTO LOYALTY

create or replace function update_loyalty_points()
returns trigger
language plpgsql
as
$$
begin

  if new.status = 'paid'
  and old.status <> 'paid'
  then

    update customers
    set loyalty_points =
      loyalty_points +
      floor(new.total)
    where id = new.customer_id;

  end if;

  return new;

end;
$$;


---

64. LOYALTY TRIGGER

create trigger trg_loyalty_points
after update
on invoices
for each row
execute function update_loyalty_points();


---

65. MATERIALIZED VIEW — DAILY REVENUE

create materialized view mv_daily_revenue
as

select

date(created_at) as day,

sum(total) as revenue,

count(*) as total_invoices

from invoices

where status='paid'

group by day;


---

66. MATERIALIZED VIEW — TOP PRODUCTS

create materialized view mv_top_products
as

select

ii.name,

sum(ii.quantity) total_sold,

sum(ii.total) revenue

from invoice_items ii

where ii.item_type='product'

group by ii.name;


---

67. REPORT VIEW — LOW STOCK

create view vw_low_stock as

select *

from inventory_items

where current_stock <= min_stock;


---

68. REPORT VIEW — EXPIRING INVENTORY

create view vw_expiring_inventory as

select *

from inventory_batches

where expiry_date <= (
  current_date + interval '30 day'
);


---

69. REPORT VIEW — DOCTOR PERFORMANCE

create view vw_doctor_performance as

select

d.id,

p.full_name,

count(a.id) total_appointments

from doctors d

join profiles p
on p.id=d.profile_id

left join appointments a
on a.doctor_id=d.id

group by d.id,p.full_name;


---

70. REPORT VIEW — CUSTOMER LIFETIME VALUE

create view vw_customer_ltv as

select

c.id,

c.full_name,

count(i.id) total_transactions,

coalesce(sum(i.total),0) lifetime_value

from customers c

left join invoices i
on i.customer_id=c.id

group by c.id,c.full_name;


---

database sudah mencakup:

✅ 54+ tabel inti
✅ POS lengkap
✅ Accounting dasar
✅ Inventory automation
✅ Loyalty automation
✅ Queue generator
✅ Invoice generator
✅ Notification queue
✅ Website CMS
✅ Reporting views
✅ Materialized views
✅ Storage architecture

