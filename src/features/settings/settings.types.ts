export interface ClinicProfile {
  name: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  updatedAt: string;
}

export interface BusinessDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

export interface Holiday {
  date: string;
  label: string;
}

export interface BusinessHoursSettings {
  schedule: BusinessDay[];
  holidays: Holiday[];
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  headerText?: string;
  footerText?: string;
}

export interface WhatsAppSettings {
  provider: 'fonnte' | 'wablas';
  apiKey?: string;
  senderNumber?: string;
}

export interface EmailSettings {
  host: string;
  port: number;
  username: string;
  password?: string;
  fromEmail: string;
  fromName?: string;
}

export interface ModuleRecord {
  id: string;
  key: string;
  name: string;
  description?: string;
  is_enabled: boolean;
}

export interface ServiceTestResult {
  success: boolean;
  message: string;
}

export interface AuditLogFilter {
  page?: number;
  pageSize?: number;
  user?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AuditLogResult {
  items: any[];
  total: number;
}
