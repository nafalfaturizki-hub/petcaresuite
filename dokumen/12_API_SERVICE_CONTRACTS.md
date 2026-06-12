PETCARE SUITE

12_API_SERVICE_CONTRACTS.md

Version 3.0

Single Source of Truth (SSOT)

API Service Layer & Data Contract Specification


---

1. OBJECTIVE

Dokumen ini mendefinisikan standar tunggal untuk:

Frontend Service Layer

Supabase Query Layer

TanStack Query Layer

DTO

Mutation Contract

Error Handling

Cache Strategy



---

2. ARCHITECTURE FLOW

Page

↓


Feature Hook

↓


Feature Service

↓


Supabase Client

↓


Database


---

Rule:

Page
TIDAK BOLEH
mengakses Supabase langsung


---

Hanya:

service.ts

yang boleh mengakses Supabase.


---

3. FEATURE STRUCTURE

Contoh:

customers/

customers.service.ts
customers.hooks.ts
customers.types.ts


---

4. SERVICE RESPONSIBILITY

Service bertanggung jawab untuk:

Query

Insert

Update

Delete

Mapping



---

Service tidak boleh:

Toast

Modal

UI State

Navigation



---

5. STANDARD RESPONSE

Semua service wajib mengembalikan:

export interface ServiceResult<T> {
  data: T;
  error: null;
}

atau

export interface ServiceError {
  data: null;
  error: Error;
}


---

Tidak boleh:

any


---

6. PAGINATION CONTRACT

export interface PaginationParams {
  page:number;
  pageSize:number;
}


---

Default:

page = 1
pageSize = 20


---

7. PAGINATED RESPONSE

export interface PaginatedResult<T>{
  data:T[];
  total:number;
  page:number;
  pageSize:number;
  totalPages:number;
}


---

8. FILTER CONTRACT

Semua list wajib support:

search?:string
status?:string
fromDate?:string
toDate?:string
sortBy?:string
sortDirection?:'asc'|'desc'


---

9. QUERY KEY STANDARD

Format:

['entity']

atau

['entity', params]


---

Contoh:

['customers']

['customers', filters]

['appointments', filters]


---

10. QUERY STALE TIME

Default:

60 seconds


---

Critical realtime:

10 seconds


---

11. INVALIDATION RULES

Customer create:

invalidate

['customers']


---

Pet create:

invalidate

['pets']


---

Invoice paid:

invalidate

['invoices']
['dashboard']
['transactions']


---

12. CUSTOMER DTO

export interface Customer {
 id:string;
 profileId?:string;

 fullName:string;
 whatsapp?:string;
 email?:string;

 address?:string;
 notes?:string;

 status:
   | 'active'
   | 'inactive'
   | 'vip'
   | 'blacklisted';

 loyaltyPoints:number;
 membershipTier?:string;

 registrationDate:string;

 createdAt:string;
 updatedAt:string;
}


---

13. CUSTOMER CREATE DTO

export interface CreateCustomerDto{
 fullName:string;
 whatsapp?:string;
 email?:string;
 address?:string;
 notes?:string;
}


---

14. CUSTOMER UPDATE DTO

export interface UpdateCustomerDto{
 fullName?:string;
 whatsapp?:string;
 email?:string;
 address?:string;
 notes?:string;
 status?:CustomerStatus;
}


---

15. CUSTOMER SERVICE CONTRACT

getCustomers()


---

getCustomerById(id)


---

createCustomer(dto)


---

updateCustomer(id,dto)


---

deleteCustomer(id)


---

16. PET DTO

export interface Pet{
 id:string;

 customerId:string;

 name:string;

 photoUrl?:string;

 speciesId:string;
 breedId:string;

 gender:
   | 'male'
   | 'female';

 birthDate?:string;

 weight?:number;

 color?:string;

 isSterilized:boolean;

 microchipNumber?:string;

 qrCode:string;

 isActive:boolean;

 createdAt:string;
 updatedAt:string;
}


---

17. PET SERVICE CONTRACT

getPets()

getPetById()

createPet()

updatePet()

deletePet()


---

18. APPOINTMENT DTO

export interface Appointment{
 id:string;

 customerId:string;

 petId:string;

 doctorId:string;

 serviceId:string;

 appointmentDate:string;

 startTime:string;

 endTime:string;

 status:
   | 'scheduled'
   | 'confirmed'
   | 'completed'
   | 'cancelled'
   | 'no-show';

 queueNumber?:number;

 notes?:string;

 createdAt:string;
 updatedAt:string;
}


---

19. APPOINTMENT SERVICE

getAppointments()

getAppointmentById()

createAppointment()

confirmAppointment()

cancelAppointment()

completeAppointment()


---

20. MEDICAL RECORD DTO

export interface MedicalRecord{
 id:string;

 appointmentId?:string;

 petId:string;

 doctorId:string;

 recordType:
   | 'consultation'
   | 'follow-up'
   | 'emergency'
   | 'surgery';

 subjective:string;
 objective:string;
 assessment:string;
 plan:string;

 notes?:string;

 createdAt:string;
 updatedAt:string;
}


---

21. MEDICAL RECORD SERVICE

getMedicalRecords()

getMedicalRecordById()

createMedicalRecord()

updateMedicalRecord()

deleteMedicalRecord()


---

22. VACCINATION DTO

export interface VaccinationRecord{
 id:string;

 petId:string;

 vaccineId:string;

 doctorId:string;

 vaccinatedAt:string;

 nextDueDate?:string;

 batchNumber?:string;

 notes?:string;

 certificateUrl?:string;
}


---

23. VACCINATION SERVICE

getVaccinations()

createVaccination()

generateCertificate()


---

24. MONITORING DTO

WeightRecord
MedicationSchedule
MedicationLog
RecoveryNote
OwnerUpload

Semua harus memiliki:

id
createdAt
updatedAt


---

25. INPATIENT DTO

InpatientRecord

harus memuat:

petId
cageId
doctorId

admitDate
dischargeDate

status
reason
notes


---

26. GROOMING DTO

GroomingRecord

harus memuat:

petId
serviceId

groomerId

scheduledAt

completedAt

status


---

27. INVENTORY DTO

InventoryItem
InventoryBatch
StockMovement
Supplier


---

28. PRODUCT DTO

Product
ProductVariant
ProductImage
Brand
Category


---

29. INVOICE DTO

export interface Invoice{
 id:string;

 invoiceNumber:string;

 customerId?:string;

 subtotal:number;

 discountAmount:number;

 total:number;

 paymentMethod:string;

 paidAmount:number;

 changeAmount:number;

 status:string;

 createdAt:string;
 paidAt?:string;
}


---

30. POS SERVICE CONTRACT

createInvoice()

payInvoice()

refundInvoice()

loadPendingBill()


---

31. ACCOUNTING DTO

Account
Transaction


---

32. NOTIFICATION DTO

NotificationLog

Fields:

channel
recipient
status
payload
sentAt
readAt


---

33. SETTINGS DTO

ClinicProfile
BusinessHours
InvoiceSettings
WhatsappConfig
SMTPConfig


---

34. FILE UPLOAD CONTRACT

Return:

{
 url:string;
 path:string;
}


---

35. STORAGE PATH STANDARD

Customer Avatar

avatars/{userId}


---

Pet Photo

pets/{petId}


---

Medical Attachment

medical-records/{recordId}


---

Grooming

grooming/{recordId}


---

Certificates

vaccines/{certificateId}


---

36. ERROR CONTRACT

export interface AppError{
 code:string;
 message:string;
 details?:unknown;
}


---

37. STANDARD ERROR CODES

VALIDATION_ERROR
NOT_FOUND
UNAUTHORIZED
FORBIDDEN
CONFLICT
DATABASE_ERROR
NETWORK_ERROR
UNKNOWN_ERROR


---

38. MUTATION PATTERN

Seluruh mutation:

useMutation

harus menggunakan:

onSuccess

untuk invalidate query.


---

39. QUERY PATTERN

Seluruh query:

useQuery

harus menggunakan:

enabled

bila membutuhkan parameter.


---

40. SOFT DELETE POLICY

Tidak ada soft delete.


---

Semua delete:

Hard Delete

kecuali:

Profiles
Products
Pets

gunakan:

isActive = false


---

41. AUDIT LOG CONTRACT

Setiap create/update/delete:

createAuditLog()

wajib dipanggil.


---

Payload:

{
 action
 tableName
 recordId
 oldValue
 newValue
}


---

42. REALTIME CHANNELS

Supabase Realtime digunakan untuk:

Appointments
Notifications
Inpatient
Queue


---

43. CACHE GROUPS

High Frequency:

Appointments
Queue
Notifications


---

Medium:

Customers
Pets
Invoices


---

Low:

Settings
Species
Breeds


---

44. EXPORT CONTRACT

Supported:

PDF
Excel
CSV


---

45. IMPORT CONTRACT

Supported:

CSV
Excel


---

Modules:

Customer
Pet
Inventory
Product


---

46. EDGE FUNCTION CONTRACT

Standard Response:

{
 success:boolean;
 message:string;
 data?:unknown;
}


---

47. SEND WHATSAPP CONTRACT

Request:

{
 to:string;
 message:string;
 provider:'fonnte'|'wablas';
 userId:string;
}


---

48. SEND EMAIL CONTRACT

Request:

{
 to:string;
 subject:string;
 html:string;
 userId:string;
}


---

49. GENERATE PDF CONTRACT

Request:

{
 type:
   | 'receipt'
   | 'invoice'
   | 'vaccine-certificate';

 id:string;
}


---

50. CONTRACT COMPLETION RULE

Pengembangan dianggap sesuai SSOT jika:

Tidak ada Supabase di UI Layer

Semua data melalui Service Layer

Semua service typed

Semua hooks typed

Semua DTO typed

Tidak ada any

Query key konsisten

Error contract konsisten

Mutation contract konsisten

Audit log otomatis

Realtime mengikuti kontrak



---

END OF 

