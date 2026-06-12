PETCARE SUITE

RLS & SECURITY SPECIFICATION

Version 3.0

Single Source of Truth (SSOT)


---

1. SECURITY OVERVIEW

Dokumen ini mendefinisikan seluruh aturan keamanan platform.

Tidak boleh ada implementasi di luar dokumen ini.

Prioritas keamanan:

1. Data Isolation
2. Authentication
3. Authorization
4. Auditability
5. Data Integrity
6. Secure Configuration


---

2. SECURITY PRINCIPLES

Least Privilege

Setiap user hanya mendapat akses minimum yang diperlukan.

Contoh:

Owner     → Full Access
Doctor    → Clinical Access
Staff     → Operational Access
Customer  → Self Data Only


---

Zero Trust

Semua request dianggap tidak dipercaya.

Setiap request wajib:

Validate Session
Validate User
Validate Role
Validate Resource Ownership


---

Defense In Depth

Keamanan harus berada di:

Frontend Guard
Backend Validation
RLS Policy
Storage Policy
Edge Function Validation

Tidak boleh bergantung pada frontend saja.


---

3. AUTHENTICATION

Authentication Provider

Supabase Auth

Metode login:

Email + Password


---

Session Flow

Login
 ↓
Supabase Auth
 ↓
JWT
 ↓
Fetch Profile
 ↓
Auth Store
 ↓
Role Validation
 ↓
Access Granted


---

Mandatory Checks

Setelah login:

profiles.is_active = true

Jika:

is_active = false

maka:

Force Logout
Redirect /login

walaupun JWT masih valid.


---

4. AUTHORIZATION MODEL

Owner

Akses:

ALL


---

Doctor

Akses:

Medical Records
Vaccinations
Monitoring
Appointments


---

Staff

Akses:

Customers
Pets
Appointments
Inventory
POS
Invoices
Inpatient
Grooming


---

Customer

Akses:

Data Milik Sendiri

Tidak boleh melihat:

Customer lain
Pet lain
Invoice lain
Medical Record lain


---

5. ROLE RESOLUTION STANDARD

Dilarang:

auth.role()

karena Supabase menghasilkan:

authenticated
anon
service_role

bukan role bisnis.


---

Wajib:

exists (
  select 1
  from profiles p
  where p.id = auth.uid()
  and p.role = 'owner'
)


---

6. OWNER HELPER FUNCTION

is_owner()

create or replace function is_owner()
returns boolean
language sql
stable
as $$
select exists (
 select 1
 from profiles
 where id = auth.uid()
 and role='owner'
);
$$;


---

is_doctor()

create or replace function is_doctor()
returns boolean;


---

is_staff()

create or replace function is_staff()
returns boolean;


---

is_customer()

create or replace function is_customer()
returns boolean;


---

7. CUSTOMER OWNERSHIP FUNCTION

Digunakan seluruh policy customer.

create or replace function current_customer_id()
returns uuid
language sql
stable
as $$
select id
from customers
where profile_id = auth.uid()
limit 1;
$$;


---

8. PET OWNERSHIP FUNCTION

create or replace function owns_pet(
 pet_uuid uuid
)
returns boolean
language sql
stable
as $$
select exists(
 select 1
 from pets
 where id = pet_uuid
 and customer_id = current_customer_id()
);
$$;


---

9. POLICY TEMPLATE A

Admin Only Tables

Digunakan untuk:

settings
audit_logs

Policy:

USING (
 is_owner()
)


---

10. POLICY TEMPLATE B

Clinical Tables

Digunakan untuk:

medical_records
prescriptions
vaccination_records

Owner:

ALL

Doctor:

ALL

Staff:

SELECT

Customer:

SELECT OWN DATA


---

11. POLICY TEMPLATE C

Operational Tables

Digunakan untuk:

customers
pets
appointments
grooming_records
inpatient_records

Owner:

ALL

Staff:

ALL

Doctor:

SELECT

Customer:

SELF DATA


---

12. POLICY TEMPLATE D

Financial Tables

Digunakan untuk:

invoices
transactions
refunds

Owner:

ALL

Staff:

SELECT
INSERT
UPDATE

Doctor:

SELECT

Customer:

OWN INVOICE ONLY


---

13. POLICY TEMPLATE E

Public Authenticated

Digunakan untuk:

modules

Authenticated:

SELECT

Owner:

ALL


---

14. PROFILES TABLE POLICIES

Read Self

auth.uid() = id


---

Update Self

auth.uid() = id


---

Owner Read All

is_owner()


---

Owner Update All

is_owner()


---

15. CUSTOMERS TABLE POLICIES

Customer Read Self

id = current_customer_id()


---

Staff Full Access

is_staff()


---

Owner Full Access

is_owner()


---

16. PETS TABLE POLICIES

Customer Read Own Pets

customer_id = current_customer_id()


---

Staff Full Access

is_staff()


---

Owner Full Access

is_owner()


---

Doctor Read

is_doctor()


---

17. MEDICAL RECORD POLICIES

Customer Read

exists(
 select 1
 from pets
 where pets.id = medical_records.pet_id
 and pets.customer_id = current_customer_id()
)


---

Doctor Full Access

is_doctor()


---

Owner Full Access

is_owner()


---

18. INVOICE POLICIES

Customer Read Own Invoice

customer_id = current_customer_id()


---

Staff Manage

is_staff()


---

Owner Full Access

is_owner()


---

19. STORAGE SECURITY


---

avatars bucket

Visibility:

Public

Allowed:

Read All
Upload Self
Update Self


---

pets bucket

Visibility:

Private

Allowed:

Owner
Doctor
Staff
Pet Owner


---

medical-records bucket

Visibility:

Private

Allowed:

Owner
Doctor

Customer:

Read Only Own Attachments


---

vaccinations bucket

Visibility:

Private

Customer dapat membaca sertifikat vaksin miliknya.


---

website bucket

Visibility:

Public

Read:

Public

Upload:

Owner Only


---

20. EDGE FUNCTION SECURITY

Semua edge function wajib:

POST only
JWT required
Role validation
Input validation
Audit logging


---

21. JWT VALIDATION FLOW

Request
 ↓
Authorization Header
 ↓
Verify JWT
 ↓
Get User
 ↓
Get Profile
 ↓
Validate Role
 ↓
Execute

Jika gagal:

401 Unauthorized


---

22. INPUT VALIDATION

Semua payload wajib:

Required fields
Type validation
Length validation
Business validation

Contoh:

phone number
email
amount
date

Tidak boleh langsung diproses.


---

23. RATE LIMITING

Login:

10 attempts / 15 minutes

Forgot Password:

5 requests / hour

Edge Functions:

60 requests / minute

per user.


---

24. AUDIT REQUIREMENTS

Wajib dicatat:

Login
Logout
Create
Update
Delete
Settings Change
Role Change
Module Change
Invoice Payment
Refund


---

25. IMMUTABLE AUDIT RULE

Tabel:

audit_logs

Tidak boleh:

UPDATE
DELETE

bahkan oleh Owner.

Hanya:

INSERT
SELECT


---

26. API KEY SECURITY

WhatsApp API Key:

Masked After Save

Contoh:

••••••••••••••••1234


---

SMTP Password:

Masked After Save

Tidak boleh ditampilkan kembali dalam bentuk asli.


---

27. SECURITY EVENTS

Wajib menghasilkan audit log:

Failed Login
Role Change
User Disabled
Settings Updated
Module Disabled


---

28. PRODUCTION SECURITY CHECKLIST

Semua item wajib selesai sebelum go-live.

✓ RLS Enabled
✓ Storage Policies Enabled
✓ JWT Validation Enabled
✓ Edge Functions Secured
✓ Audit Logs Active
✓ Rate Limiting Active
✓ API Keys Masked
✓ Owner Isolation Verified
✓ Customer Isolation Verified
✓ Backup Configured
✓ Restore Tested


---

29. SECURITY ACCEPTANCE CRITERIA

Sistem dianggap aman jika:

Customer tidak dapat melihat data customer lain
Customer tidak dapat melihat invoice customer lain
Customer tidak dapat melihat medical record customer lain
Doctor tidak dapat mengubah settings
Staff tidak dapat mengakses laporan owner
Owner dapat mengaudit seluruh aktivitas
Semua upload file mengikuti RLS
Semua Edge Functions memverifikasi JWT


---

END OF DOCUMENT — 
