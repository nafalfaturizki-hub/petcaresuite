import { useQuery } from '@tanstack/react-query';
import { portalService } from './portal.service';

export function usePortalCustomerId(profileId?: string) {
  return useQuery(['portalCustomerId', profileId], () => (profileId ? portalService.getCustomerIdByProfileId(profileId) : Promise.resolve(null)), {
    enabled: Boolean(profileId)
  });
}

export function usePortalCustomer(profileId?: string) {
  return useQuery(['portalCustomer', profileId], () => (profileId ? portalService.getCustomerByProfileId(profileId) : Promise.resolve(null)), {
    enabled: Boolean(profileId)
  });
}

export function usePortalPets(customerId?: string) {
  return useQuery(['portalPets', customerId], () => (customerId ? portalService.getPetsForCustomer(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalAppointments(customerId?: string) {
  return useQuery(['portalAppointments', customerId], () => (customerId ? portalService.getUpcomingAppointments(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalInvoices(customerId?: string) {
  return useQuery(['portalInvoices', customerId], () => (customerId ? portalService.getInvoicesForCustomer(customerId) : []), {
    enabled: Boolean(customerId)
  });
}

export function usePortalSummary(customerId?: string) {
  return useQuery(['portalSummary', customerId], () => (customerId ? portalService.getPortalSummary(customerId) : Promise.resolve({ petCount: 0, appointmentCount: 0, invoiceCount: 0 })), {
    enabled: Boolean(customerId)
  });
}
