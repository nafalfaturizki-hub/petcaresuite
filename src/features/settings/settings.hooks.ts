import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { settingsService } from './settings.service';
import type { AuditLogFilter, AuditLogResult, BusinessHoursSettings, EmailSettings, InvoiceSettings, ModuleRecord, ServiceTestResult, WhatsAppSettings, ClinicProfile } from './settings.types';

export function useClinicProfile() {
  return useQuery(['settings', 'clinicProfile'], () => settingsService.getClinicProfile());
}

export function useUpdateClinicProfile() {
  const queryClient = useQueryClient();
  return useMutation((profile: Partial<ClinicProfile>) => settingsService.updateClinicProfile(profile), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'clinicProfile']);
      toast.success('Clinic profile updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update clinic profile');
    }
  });
}

export function useBusinessHours() {
  return useQuery(['settings', 'businessHours'], () => settingsService.getBusinessHours());
}

export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();
  return useMutation((hours: BusinessHoursSettings) => settingsService.updateBusinessHours(hours), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'businessHours']);
      toast.success('Business hours updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update business hours');
    }
  });
}

export function useInvoiceSettings() {
  return useQuery(['settings', 'invoiceSettings'], () => settingsService.getInvoiceSettings());
}

export function useUpdateInvoiceSettings() {
  const queryClient = useQueryClient();
  return useMutation((settings: Partial<InvoiceSettings>) => settingsService.updateInvoiceSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'invoiceSettings']);
      toast.success('Invoice settings updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update invoice settings');
    }
  });
}

export function useWhatsAppSettings() {
  return useQuery(['settings', 'whatsappSettings'], () => settingsService.getWhatsAppSettings());
}

export function useSaveWhatsAppSettings() {
  const queryClient = useQueryClient();
  return useMutation((settings: WhatsAppSettings) => settingsService.saveWhatsAppSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'whatsappSettings']);
      toast.success('WhatsApp settings saved');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to save WhatsApp settings');
    }
  });
}

export function useEmailSettings() {
  return useQuery(['settings', 'emailSettings'], () => settingsService.getEmailSettings());
}

export function useSaveEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation((settings: EmailSettings) => settingsService.saveEmailSettings(settings), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'emailSettings']);
      toast.success('Email settings saved');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to save email settings');
    }
  });
}

export function useModules() {
  return useQuery(['settings', 'modules'], () => settingsService.getModules());
}

export function useToggleModule() {
  const queryClient = useQueryClient();
  return useMutation(({ key, isEnabled }: { key: string; isEnabled: boolean }) => settingsService.toggleModule(key, isEnabled), {
    onSuccess: () => {
      queryClient.invalidateQueries(['settings', 'modules']);
      toast.success('Module updated');
    },
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to update module');
    }
  });
}

export function useTestWhatsApp() {
  return useMutation((number: string) => settingsService.testWhatsApp(number), {
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to send WhatsApp test');
    }
  });
}

export function useTestEmail() {
  return useMutation((email: string) => settingsService.testEmail(email), {
    onError: (error: any) => {
      toast.error(error?.message ?? 'Unable to send email test');
    }
  });
}

export function useAuditLogs(filters: AuditLogFilter = {}) {
  return useQuery(['settings', 'auditLogs', filters], () => settingsService.getAuditLogs(filters));
}

export default {};
