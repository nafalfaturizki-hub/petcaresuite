PETCARE SUITE

05_BACKEND_ARCHITECTURE.md

Version 3.0

Single Source of Truth (SSOT)


---

1. OVERVIEW

Backend menggunakan:

Supabase Cloud
PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
Supabase Edge Functions

Tidak ada backend Express.

Tidak ada NestJS.

Tidak ada Laravel.

Seluruh backend berada dalam:

supabase/


---

2. BACKEND RESPONSIBILITY

Backend bertanggung jawab terhadap:

Authentication
Authorization
Database
Storage
Realtime
Notifications
PDF Generation
Queue Generation
Accounting Automation
Inventory Automation
Audit Logging


---

3. DATABASE ARCHITECTURE

Database menggunakan:

PostgreSQL

Mode:

Single Tenant
Single Clinic

Setiap instalasi:

1 Supabase Project
=
1 Klinik


---

4. DATABASE STRUCTURE

supabase/
├── migrations/
├── functions/
├── seed.sql
└── config.toml


---

5. MIGRATION STANDARD

Format:

001_initial_schema.sql
002_auth_profiles.sql
003_customers.sql
004_pets.sql
005_appointments.sql

Tidak boleh:

migration.sql
new.sql
update.sql


---

6. MIGRATION RULES

Migration wajib:

BEGIN;
...
COMMIT;


---

Rollback wajib aman.

Tidak boleh migration yang merusak data.


---

7. ENUM DEFINITIONS

user_role_enum

owner
doctor
staff
customer


---

module_key_enum

clinic
monitoring
inpatient
grooming
petshop
inventory
accounting
website


---

appointment_status_enum

scheduled
confirmed
completed
cancelled
no-show


---

customer_status_enum

active
inactive
vip
blacklisted


---

payment_method_enum

cash
card
bank-transfer
e-wallet


---

invoice_status_enum

draft
pending
paid
cancelled
refunded


---

8. REQUIRED DATABASE EXTENSIONS

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;


---

9. COMMON COLUMNS STANDARD

Semua tabel wajib:

created_at timestamptz
updated_at timestamptz


---

Default:

default now()


---

10. UPDATED_AT AUTOMATION

Function:

set_updated_at()


---

Trigger:

before update


---

Semua tabel wajib menggunakan trigger ini.


---

11. UUID STANDARD

Primary key:

uuid


---

Default:

gen_random_uuid()


---

Tidak diperbolehkan:

serial
bigserial

sebagai PK.


---

12. INDEXING STANDARD

Semua FK wajib memiliki index.


---

Contoh:

create index idx_pets_customer
on pets(customer_id);


---

13. SEARCH INDEXES

Customer:

full_name
email
whatsapp

menggunakan:

gin
trgm


---

Pet:

name
microchip_number


---

Produk:

name
sku
barcode


---

14. PROFILE SYSTEM

Auth:

auth.users

Profile:

profiles


---

1 user auth

=

1 profile


---

15. PROFILE AUTOMATION

Saat user dibuat:

auth.users

otomatis:

insert profiles

menggunakan trigger.


---

16. AUDIT LOG SYSTEM

Semua operasi penting:

INSERT
UPDATE
DELETE

dicatat.


---

Table:

audit_logs


---

Data:

user_id
action
table_name
record_id
old_value
new_value
created_at


---

17. AUDIT EXCLUDED TABLES

Tidak perlu audit:

notifications_log
weight_records
medication_logs

untuk menghindari ledakan data.


---

18. STORAGE ARCHITECTURE

Bucket:

avatars
medical-records
vaccinations
grooming
pet-photos
articles
documents


---

19. STORAGE RULES

Customer tidak boleh melihat file milik customer lain.


---

Owner:

full access


---

Doctor:

medical access


---

Staff:

operational access


---

20. REALTIME CHANNELS

Realtime digunakan untuk:

Appointments
Queue
Notifications
Inpatient
Monitoring


---

21. APPOINTMENT REALTIME

Broadcast:

created
updated
cancelled
completed


---

22. QUEUE REALTIME

Broadcast:

queue_called
queue_next
queue_finished


---

23. INVENTORY AUTOMATION

Saat:

Stock In

maka:

current_stock += qty


---

Saat:

Stock Out

maka:

current_stock -= qty


---

Dilakukan oleh trigger database.


---

24. INVENTORY VALIDATION

Tidak boleh:

current_stock < 0


---

Trigger wajib reject.


---

25. INVOICE NUMBER SYSTEM

Tidak boleh:

Date.now()


---

Wajib sequence.


---

Format:

INV-20260613-000001


---

26. INVOICE SEQUENCE TABLE

invoice_sequences


---

Kolom:

date
last_number


---

27. INVOICE FUNCTION

Function:

generate_invoice_number()


---

Atomic.


---

Race condition safe.


---

28. QUEUE NUMBER SYSTEM

Table:

queue_counters


---

Function:

generate_queue_number()


---

Atomic.


---

Retry loop wajib.


---

29. APPOINTMENT AUTOMATION

Saat:

scheduled
→
confirmed

maka:

queue_number dibuat

otomatis.


---

30. LOYALTY ENGINE

Konstanta:

1 poin = Rp1 transaksi


---

Redeem:

1 poin = Rp100 diskon


---

31. LOYALTY EARNING

Saat invoice:

paid

maka:

customer.loyalty_points += total


---

32. LOYALTY REDEEM

Saat checkout:

customer.loyalty_points -= used_points


---

Tidak boleh minus.


---

33. ACCOUNTING AUTOMATION

Saat invoice paid:

otomatis:

transactions

dibuat.


---

Account:

Revenue


---

34. ACCOUNTING ENTRIES

Contoh:

Invoice Rp500.000


---

Generate:

Revenue +500.000
Cash +500.000


---

35. REFUND AUTOMATION

Saat refund:

Revenue -amount


---

Transaction otomatis dibuat.


---

36. VACCINATION ENGINE

Saat vaksin dibuat:

vaccination_record

otomatis membuat reminder.


---

37. REMINDER GENERATION

Generate:

H-30
H-14
H-7
H-1


---

Masuk:

vaccination_reminders


---

38. EXPIRY ALERT ENGINE

Inventory batch.


---

Generate alert:

90 hari
60 hari
30 hari

sebelum expired.


---

39. NOTIFICATION ENGINE

Notification Queue:

notification_jobs

(Tabel baru yang direkomendasikan)


---

Status:

pending
processing
sent
failed


---

40. NOTIFICATION RETRY

Retry:

3 kali


---

Jika gagal:

failed


---

41. PDF ENGINE

Supported:

Invoice
Receipt
Vaccination Certificate


---

Output:

PDF


---

Upload:

Storage


---

Return:

Public/Signed URL


---

42. WEBSITE CMS

Website data berasal dari:

articles
testimonials
website_content


---

Tidak hardcoded.


---

43. MODULE SYSTEM

Source:

modules


---

Frontend membaca:

modules.is_enabled


---

44. SETTINGS SYSTEM

Source:

settings


---

Format:

key
value(jsonb)


---

45. SETTINGS KEYS

clinic_profile
business_hours
invoice_settings
smtp_config
whatsapp_config
notification_templates


---

46. SECURITY DEFINER FUNCTIONS

Hanya:

generate_invoice_number
generate_queue_number


---

Wajib:

security definer
set search_path=''


---

47. ROW LEVEL SECURITY

Semua tabel:

ENABLE ROW LEVEL SECURITY


---

Tidak ada pengecualian.


---

48. ROLE LOOKUP RULE

SELALU:

exists(
 select 1
 from profiles p
 where p.id = auth.uid()
 and p.role='owner'
)


---

JANGAN PERNAH:

auth.role()='owner'


---

49. CUSTOMER SELF ACCESS

Customer hanya boleh melihat:

data miliknya
pet miliknya
invoice miliknya
appointment miliknya


---

Tidak boleh data customer lain.


---

50. BACKEND ACCEPTANCE CRITERIA

Backend dianggap selesai jika:

✓ Semua migration berjalan
✓ Semua trigger berjalan
✓ Semua sequence berjalan
✓ Queue generator aman
✓ Invoice generator aman
✓ Loyalty berjalan
✓ Accounting otomatis berjalan
✓ Reminder otomatis berjalan
✓ Notification queue berjalan
✓ Audit log berjalan
✓ Storage aman
✓ RLS seluruh tabel aktif
✓ Tidak ada privilege escalation
✓ Semua Edge Function tervalidasi JWT
✓ Database siap production


---

END OF DOCUMENT — 
