PETCARE SUITE

10_DATABASE_MIGRATION_MASTER.md

Version 3.0

Single Source of Truth (SSOT)

Master Database Migration Blueprint


---

1. OBJECTIVE

Dokumen ini menjadi referensi tunggal seluruh migration database.

Tujuan:

Deterministic
Repeatable
Versioned
Auditable
Rollbackable

Tidak boleh ada migration yang dibuat di luar urutan dokumen ini.


---

2. MIGRATION STRATEGY

Semua migration menggunakan format:

001_initial_extensions.sql
002_enum_types.sql
003_profiles.sql
...


---

Format:

NNN_description.sql

Contoh:

001_initial_extensions.sql
002_enum_types.sql
003_profiles.sql


---

3. MIGRATION EXECUTION ORDER

Urutan wajib:

Extensions

Enums

Core Tables

Reference Tables

Business Tables

Functions

Triggers

Views

Materialized Views

RLS

Seed


---

Tidak boleh dibalik.


---

4. MIGRATION 001

001_initial_extensions.sql


---

Install:

pgcrypto
uuid-ossp
pg_trgm
unaccent
pg_stat_statements


---

5. MIGRATION 002

002_enum_types.sql


---

Create:

user_role_enum

module_key_enum

appointment_status_enum

customer_status_enum

cage_status_enum

payment_method_enum

stock_movement_type_enum

notification_provider_enum

account_type_enum

transaction_type_enum

invoice_status_enum

medical_record_type_enum

vaccination_channel_enum


---

6. MIGRATION 003

003_profiles.sql


---

Create:

profiles


---

Dependencies:

auth.users


---

7. MIGRATION 004

004_settings.sql


---

Create:

settings
modules
audit_logs
notifications_log


---

8. MIGRATION 005

005_customers.sql


---

Create:

customers


---

9. MIGRATION 006

006_species_breeds.sql


---

Create:

species
breeds


---

10. MIGRATION 007

007_pets.sql


---

Create:

pets


---

Depends:

customers
species
breeds


---

11. MIGRATION 008

008_services_doctors.sql


---

Create:

services
doctors
doctor_schedules


---

12. MIGRATION 009

009_appointments.sql


---

Create:

appointments
queue_counters


---

13. MIGRATION 010

010_medical_records.sql


---

Create:

medical_records
prescriptions
medical_attachments


---

14. MIGRATION 011

011_vaccinations.sql


---

Create:

vaccines
vaccination_records
vaccination_reminders


---

15. MIGRATION 012

012_monitoring.sql


---

Create:

weight_records

medication_schedules

medication_logs

recovery_notes

owner_uploads


---

16. MIGRATION 013

013_inpatient.sql


---

Create:

cages

inpatient_records

daily_observations

inpatient_medication_schedules


---

17. MIGRATION 014

014_grooming.sql


---

Create:

grooming_services
grooming_records


---

18. MIGRATION 015

015_inventory.sql


---

Create:

inventory_categories

suppliers

inventory_items

inventory_batches

stock_movements


---

19. MIGRATION 016

016_petshop.sql


---

Create:

product_categories

brands

products

product_variants

product_images


---

20. MIGRATION 017

017_pos.sql


---

Create:

invoices

invoice_items

refunds


---

21. MIGRATION 018

018_accounting.sql


---

Create:

accounts
transactions


---

22. MIGRATION 019

019_website.sql


---

Create:

articles

testimonials

website_content


---

23. MIGRATION 020

020_storage_buckets.sql


---

Create buckets:

avatars

pets

medical

vaccination

grooming

articles

documents

portal


---

24. MIGRATION 021

021_database_functions.sql


---

Functions:

generate_queue_number()

generate_invoice_number()

create_vaccine_reminders()

create_audit_log()

refresh_reports()


---

25. MIGRATION 022

022_updated_at_triggers.sql


---

Create:

set_updated_at()


---

Apply to all tables.


---

26. MIGRATION 023

023_audit_triggers.sql


---

Create:

audit_trigger()


---

Apply:

Customers
Pets
Appointments
Medical Records
Invoices
Inventory
Products


---

27. MIGRATION 024

024_inventory_triggers.sql


---

Create:

after_stock_movement()


---

Responsibilities:

Update current_stock

Validate stock

Create audit event


---

28. MIGRATION 025

025_invoice_triggers.sql


---

Create:

after_invoice_paid()


---

Responsibilities:

Accounting Entry

Loyalty Points

Notifications


---

29. MIGRATION 026

026_vaccination_triggers.sql


---

Create:

after_vaccination_insert()


---

Responsibilities:

Generate reminders


---

30. MIGRATION 027

027_materialized_views.sql


---

Create:

mv_daily_revenue

mv_monthly_revenue

mv_doctor_revenue

mv_inventory_value


---

31. MIGRATION 028

028_reporting_views.sql


---

Create:

vw_dashboard_summary

vw_revenue_summary

vw_inventory_summary

vw_customer_growth

vw_doctor_performance


---

32. MIGRATION 029

029_realtime_setup.sql


---

Enable realtime:

appointments

notifications_log

daily_observations

owner_uploads


---

33. MIGRATION 030

030_rls_enable.sql


---

Enable RLS:

ALTER TABLE ...
ENABLE ROW LEVEL SECURITY

Untuk seluruh tabel.


---

34. MIGRATION 031

031_rls_profiles.sql


---

Policies:

Owner Full

Self Read

Self Update


---

35. MIGRATION 032

032_rls_settings.sql


---

Policies:

Owner Only


---

36. MIGRATION 033

033_rls_customers.sql


---

Policies:

Owner

Staff

Doctor Read

Customer Self


---

37. MIGRATION 034

034_rls_pets.sql


---

Policies:

Owner

Staff

Doctor Read

Customer Self


---

38. MIGRATION 035

035_rls_appointments.sql


---

Policies:

Owner

Staff

Doctor

Customer Own


---

39. MIGRATION 036

036_rls_medical.sql


---

Policies:

Owner

Doctor Full

Staff Read

Customer Own


---

40. MIGRATION 037

037_rls_vaccination.sql


---

Policies:

Owner

Doctor

Staff

Customer Own


---

41. MIGRATION 038

038_rls_monitoring.sql


---

Policies seluruh monitoring.


---

42. MIGRATION 039

039_rls_inpatient.sql


---

Policies seluruh inpatient.


---

43. MIGRATION 040

040_rls_grooming.sql


---

Policies grooming.


---

44. MIGRATION 041

041_rls_inventory.sql


---

Policies inventory.


---

45. MIGRATION 042

042_rls_petshop.sql


---

Policies petshop.


---

46. MIGRATION 043

043_rls_pos.sql


---

Policies:

Invoices

Invoice Items

Refunds


---

47. MIGRATION 044

044_rls_accounting.sql


---

Policies accounting.


---

48. MIGRATION 045

045_rls_notifications.sql


---

Policies:

Notifications Log


---

49. MIGRATION 046

046_rls_website.sql


---

Policies website CMS.


---

50. MIGRATION 047

047_storage_policies.sql


---

Policies:

avatars

pets

medical

vaccination

grooming

documents

portal


---

51. MIGRATION 048

048_seed_modules.sql


---

Seed:

modules


---

52. MIGRATION 049

049_seed_settings.sql


---

Seed:

settings


---

53. MIGRATION 050

050_seed_master_data.sql


---

Seed:

species

breeds

accounts

grooming_services


---

54. DATABASE FUNCTION STANDARDS

Semua function wajib:

SECURITY DEFINER
SET search_path


---

Contoh:

security definer
set search_path = public


---

55. FUNCTION NAMING

Pattern:

verb_entity


---

Contoh:

generate_invoice_number

create_vaccine_reminders

refresh_reports


---

56. TRIGGER NAMING

Pattern:

trg_table_action


---

Contoh:

trg_invoice_paid

trg_stock_update

trg_vaccination_reminder


---

57. INDEXING STRATEGY

Setiap FK:

CREATE INDEX

wajib.


---

58. SEARCH INDEXES

Gunakan:

GIN

untuk:

customers

pets

articles

products


---

59. TRIGRAM SEARCH

Gunakan:

pg_trgm

untuk:

customer_name

pet_name

product_name


---

60. PARTITION READINESS

Tabel besar:

audit_logs

notifications_log

medical_records

harus siap partitioning.


---

61. MATERIALIZED VIEW REFRESH

Nightly:

refresh materialized view concurrently


---

Jam:

02:00 WIB


---

62. BACKUP SAFE MIGRATIONS

Migration tidak boleh:

DROP TABLE

langsung.


---

Gunakan:

ALTER TABLE

atau migration khusus.


---

63. ROLLBACK STRATEGY

Setiap migration wajib memiliki:

rollback script


---

Format:

rollback/
001.sql
002.sql
...


---

64. SEED STRATEGY

Master data:

UPSERT


---

Tidak boleh:

INSERT ONLY


---

65. FRESH INSTALL FLOW

db reset

↓

migration 001-050

↓

seed

↓

owner creation

↓

ready


---

66. DATABASE HEALTH CHECKS

Verifikasi:

Semua FK valid

Semua index valid

Semua RLS aktif

Semua trigger aktif

Semua views valid

Semua functions valid



---

67. ESTIMASI DATABASE SQL

Area	LOC

Tables	7.000
Functions	4.000
Triggers	3.000
RLS	6.000
Views	2.000
Seeds	2.000



---

Total SQL

±24.000 LOC


---

68. ACCEPTANCE CRITERIA

Database dianggap selesai jika:

Fresh install berhasil

Semua migration berhasil

Semua seed berhasil

Semua FK valid

Semua trigger berjalan

Semua RLS aman

Semua views berjalan

Semua functions berjalan

Semua tests lulus



---

END OF 

