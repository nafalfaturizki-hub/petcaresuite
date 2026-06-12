PETCARE SUITE

11_UI_UX_DESIGN_SYSTEM.md

Version 3.0

Single Source of Truth (SSOT)

Design System & User Experience Specification


---

1. OBJECTIVE

Dokumen ini menjadi standar tunggal seluruh tampilan PetCare Suite.

Tujuan:

Consistent
Professional
Modern
Responsive
Accessible
Fast
Clinic Friendly

Seluruh halaman wajib mengikuti dokumen ini.


---

2. DESIGN PRINCIPLES

Principle #1

Petugas klinik harus bisa menyelesaikan tugas utama dalam:

≤ 3 klik


---

Principle #2

Data lebih penting daripada dekorasi.

Prioritas:

Data
Action
Navigation
Visual


---

Principle #3

Mobile First Desktop Optimized


---

Principle #4

Semua informasi penting harus terlihat tanpa scrolling berlebihan.


---

Principle #5

Tidak ada dead-end page.

Setiap halaman wajib memiliki:

Back
Action
Navigation


---

3. DESIGN LANGUAGE

Style:

Modern SaaS
Healthcare
Clean
Minimal
Professional


---

Inspirasi:

Linear

Stripe Dashboard

Supabase Dashboard

Notion

Vercel Dashboard



---

4. COLOR SYSTEM

Primary

Primary-50   #EFF6FF
Primary-100  #DBEAFE
Primary-200  #BFDBFE
Primary-300  #93C5FD
Primary-400  #60A5FA
Primary-500  #3B82F6
Primary-600  #2563EB
Primary-700  #1D4ED8
Primary-800  #1E40AF
Primary-900  #1E3A8A


---

Success

#22C55E


---

Warning

#F59E0B


---

Danger

#EF4444


---

Info

#06B6D4


---

5. NEUTRAL COLORS

Gray-50
Gray-100
Gray-200
Gray-300
Gray-400
Gray-500
Gray-600
Gray-700
Gray-800
Gray-900

Tailwind default.


---

6. SEMANTIC COLORS

Appointment

Scheduled  = Blue
Confirmed  = Cyan
Completed  = Green
Cancelled  = Red
No Show    = Gray


---

Invoice

Draft      = Gray
Pending    = Yellow
Paid       = Green
Cancelled  = Red
Refunded   = Orange


---

Grooming

Scheduled   = Blue
In Progress = Purple
Completed   = Green
Cancelled   = Red


---

Inpatient

Admitted     = Blue
Transferred  = Yellow
Discharged   = Green


---

7. TYPOGRAPHY

Font:

Inter

Fallback:

system-ui
sans-serif


---

8. FONT SCALE

Heading 1

36px
700


---

Heading 2

30px
700


---

Heading 3

24px
600


---

Heading 4

20px
600


---

Body Large

16px
400


---

Body

14px
400


---

Caption

12px
400


---

9. SPACING SYSTEM

Based on:

4px

grid.


---

Scale:

4
8
12
16
20
24
32
40
48
64
80
96


---

10. BORDER RADIUS

Small

6px


---

Medium

8px


---

Large

12px


---

Extra Large

16px


---

11. SHADOWS

Small

shadow-sm


---

Medium

shadow-md


---

Large

shadow-lg


---

Default:

shadow-sm


---

12. LAYOUT GRID

Desktop:

12 Columns


---

Tablet:

8 Columns


---

Mobile:

4 Columns


---

13. MAX CONTENT WIDTH

Dashboard:

100%


---

Website:

1280px


---

Forms:

900px


---

14. PAGE STRUCTURE

Semua halaman:

<PageHeader />

<Filters />

<Content />


---

Tidak boleh:

Random Layout


---

15. PAGE HEADER

Komponen wajib:

Title
Description
Actions
Breadcrumb


---

Contoh:

Customers

Kelola data pelanggan klinik


---

16. CARD STANDARD

Padding:

24px


---

Gap:

16px


---

Radius:

12px


---

17. BUTTON STANDARD

Size:

sm
md
lg


---

Default:

md


---

Variants:

Primary
Secondary
Outline
Ghost
Destructive


---

18. BUTTON ICON RULES

Icon selalu:

16px


---

Gap:

8px


---

19. FORM DESIGN

Label di atas field.


---

Benar:

Nama Customer

[input]


---

Salah:

Nama Customer [input]


---

20. FORM FIELD HEIGHT

Default:

40px


---

Large:

48px


---

21. FORM VALIDATION

Error muncul:

Realtime


---

Posisi:

Di bawah field


---

Warna:

Red-500


---

22. TABLE DESIGN

Menggunakan:

TanStack Table


---

23. TABLE HEIGHT

Rows:

48px


---

Header:

48px


---

24. TABLE FEATURES

Wajib:

Search

Pagination

Sort

Export



---

25. STATUS BADGES

Ukuran:

28px

height.


---

Radius:

999px


---

26. SEARCH INPUT

Icon:

Search

kiri.


---

Debounce:

300ms


---

27. FILTER BAR

Selalu berada:

Di bawah PageHeader


---

28. SIDEBAR

Width:

280px


---

Collapsed:

80px


---

29. SIDEBAR GROUPS

Main
Clinical
Operations
Finance
System


---

30. TOPBAR

Height:

64px


---

Komponen:

Search
Notifications
Profile


---

31. DASHBOARD KPI CARDS

Minimal:

4 Cards


---

Data:

Revenue
Appointments
Patients
Inventory


---

32. KPI CARD DESIGN

Icon
Value
Label
Trend


---

33. CHART DESIGN

Height:

320px


---

Padding:

16px


---

34. EMPTY STATE

Komponen:

Icon
Title
Description
Action


---

35. LOADING STATE

Gunakan:

Skeleton


---

Tidak boleh:

Fullscreen Spinner


---

36. ERROR STATE

Komponen:

Icon
Title
Description
Retry


---

37. MODAL STANDARD

Width:

600px


---

Max:

90vw


---

38. DRAWER STANDARD

Digunakan untuk:

Edit
Detail
Preview


---

39. CONFIRMATION DIALOG

Wajib untuk:

Delete

Refund

Discharge

Cancel Appointment



---

40. FILE UPLOAD UI

Support:

Drag & Drop
Browse File
Preview


---

41. IMAGE PREVIEW

Support:

Zoom
Remove
Replace


---

42. QR CODE PAGE

Menampilkan:

Pet Photo
Pet Name
Owner
QR
Print
Download


---

43. CALENDAR VIEW

Support:

Day
Week
Month


---

44. APPOINTMENT BOARD

Color by status.


---

Drag and Drop:

Optional v2


---

45. MOBILE NAVIGATION

Gunakan:

Drawer Sidebar


---

46. MOBILE TABLES

Transform menjadi:

Card List


---

Bukan horizontal scroll panjang.


---

47. MOBILE FORMS

Selalu:

Single Column


---

48. ACCESSIBILITY

Minimum:

WCAG AA


---

49. KEYBOARD SUPPORT

Wajib:

Tab
Enter
Escape


---

50. DARK MODE

Support penuh.


---

Semua komponen wajib lolos dark mode.


---

51. PRINT MODE

Support:

Invoice
Receipt
Vaccination Certificate
QR Card


---

52. PDF PREVIEW

Inline preview sebelum download.


---

53. CUSTOMER PORTAL STYLE

Lebih sederhana dibanding dashboard internal.


---

Fokus:

Pet
Appointment
Invoice
Monitoring


---

54. PUBLIC WEBSITE STYLE

Lebih marketing-oriented.


---

Komponen:

Hero
Services
Doctors
Testimonials
Blog
CTA


---

55. ANIMATION

Gunakan:

Framer Motion

opsional.


---

Durasi:

150ms–250ms


---

56. MICRO INTERACTIONS

Wajib:

Hover

Focus

Active

Disabled



---

57. ICON STANDARD

Library:

Lucide React


---

Ukuran default:

18px


---

58. RESPONSIVE BREAKPOINTS

sm 640
md 768
lg 1024
xl 1280
2xl 1536


---

59. UI ACCEPTANCE CRITERIA

UI dianggap selesai jika:

Responsive

Accessible

Dark mode ready

Empty state ada

Loading state ada

Error state ada

Konsisten seluruh modul

Tidak ada layout shift



---

60. DESIGN SYSTEM DELIVERABLES

Wajib tersedia:

Figma Design System

Color Tokens

Typography Tokens

Component Library

Dashboard Layouts

Portal Layouts

Website Layouts

Mobile Layouts



---

END OF 
