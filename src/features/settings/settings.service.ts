import { supabase } from '@/lib/supabase';
import type {
  ClinicProfile,
  BusinessHoursSettings,
  InvoiceSettings,
  WhatsAppSettings,
  EmailSettings,
  ModuleRecord,
  ServiceTestResult,
  AuditLogFilter,
  AuditLogResult
} from './settings.types';

function maskSecret(value?: string) {
  if (!value) return '';
  const last4 = value.slice(-4);
  return `••••${last4}`;
}

export const settingsService = {
  async getSetting<T>(key: string): Promise<T | null> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error || !data) {
      return null;
    }
    return data.value as T;
  },

  async upsertSetting(key: string, value: unknown) {
    const { error } = await supabase.from('settings').upsert({ key, value }).select();
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  async getClinicProfile(): Promise<ClinicProfile | null> {
    return this.getSetting<ClinicProfile>('clinic_profile');
  },

  async updateClinicProfile(profile: Partial<ClinicProfile>) {
    return this.upsertSetting('clinic_profile', {
      ...(profile as ClinicProfile),
      updatedAt: new Date().toISOString()
    });
  },

  async getBusinessHours(): Promise<BusinessHoursSettings> {
    const existing = await this.getSetting<BusinessHoursSettings>('business_hours');
    if (existing) return existing;

    return {
      schedule: Array.from({ length: 7 }, (_, index) => ({
        dayOfWeek: index,
        startTime: '08:00',
        endTime: '17:00',
        isClosed: false
      })),
      holidays: []
    };
  },

  async updateBusinessHours(hours: BusinessHoursSettings) {
    return this.upsertSetting('business_hours', hours);
  },

  async getInvoiceSettings(): Promise<InvoiceSettings> {
    const existing = await this.getSetting<InvoiceSettings>('invoice_settings');
    return existing ?? { prefix: 'INV', nextNumber: 1, headerText: '', footerText: '' };
  },

  async updateInvoiceSettings(settings: Partial<InvoiceSettings>) {
    const current = await this.getInvoiceSettings();
    return this.upsertSetting('invoice_settings', { ...current, ...settings });
  },

  async getWhatsAppSettings(): Promise<WhatsAppSettings | null> {
    const settings = await this.getSetting<WhatsAppSettings>('whatsapp_config');
    if (!settings) return null;
    return {
      ...settings,
      apiKey: maskSecret(settings.apiKey)
    };
  },

  async saveWhatsAppSettings(settings: WhatsAppSettings) {
    return this.upsertSetting('whatsapp_config', settings);
  },

  async getEmailSettings(): Promise<EmailSettings | null> {
    const settings = await this.getSetting<EmailSettings>('smtp_config');
    if (!settings) return null;
    return {
      ...settings,
      password: maskSecret(settings.password)
    };
  },

  async saveEmailSettings(settings: EmailSettings) {
    return this.upsertSetting('smtp_config', settings);
  },

  async getModules(): Promise<ModuleRecord[]> {
    const { data, error } = await supabase.from('modules').select('*').order('key');
    if (error) {
      throw new Error(error.message);
    }
    return (data || []) as ModuleRecord[];
  },

  async toggleModule(key: string, isEnabled: boolean) {
    const { error } = await supabase.from('modules').update({ is_enabled: isEnabled }).eq('key', key).select();
    if (error) {
      throw new Error(error.message);
    }
    return true;
  },

  async testWhatsApp(testNumber: string): Promise<ServiceTestResult> {
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: { number: testNumber, message: 'Test message from PetCare Suite' }
      } as any);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'WhatsApp test sent successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unable to send WhatsApp test' };
    }
  },

  async testEmail(testAddress: string): Promise<ServiceTestResult> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { email: testAddress, subject: 'PetCare Suite test email', body: 'This is a test message.' }
      } as any);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Email test sent successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unable to send email test' };
    }
  },

  async getAuditLogs(filters: AuditLogFilter = {}): Promise<AuditLogResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 50;
    const offset = (page - 1) * pageSize;
    let query: any = supabase.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (filters.user) query = query.eq('user_id', filters.user);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
    if (filters.toDate) query = query.lte('created_at', filters.toDate);

    const { data, count, error } = await query.range(offset, offset + pageSize - 1);
    if (error) {
      throw new Error(error.message);
    }

    return { items: (data || []) as any[], total: typeof count === 'number' ? count : (data || []).length };
  }
};

export default settingsService;
