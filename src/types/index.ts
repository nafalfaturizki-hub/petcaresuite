export type UserRole = 'owner' | 'doctor' | 'staff' | 'customer';

export type ModuleKey =
  | 'clinic'
  | 'monitoring'
  | 'inpatient'
  | 'grooming'
  | 'petshop'
  | 'inventory'
  | 'accounting'
  | 'website';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type CustomerStatus = 'active' | 'inactive' | 'vip' | 'blacklisted';

export type CageStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'e-wallet';

export type StockMovementType = 'inbound' | 'outbound' | 'adjustment';

export type NotificationProvider = 'email' | 'whatsapp' | 'sms';

export type InvoiceStatus = 'draft' | 'paid' | 'pending' | 'cancelled' | 'refunded';
export type MedicalRecordType = 'consultation' | 'follow-up' | 'emergency' | 'surgery';
export type GroomingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type InpatientStatus = 'admitted' | 'discharged' | 'transferred';
export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type TransactionType = 'credit' | 'debit';
export type MovementType = 'inbound' | 'outbound' | 'adjustment';
export type NotificationStatus = 'sent' | 'failed' | 'pending';

export type ModuleStatus = Record<ModuleKey, boolean>;
