import { supabase } from '@/lib/supabase';
import type { PortalCustomer, PortalPet, PortalAppointment, PortalInvoice, PortalSummary } from './portal.types';

export const portalService = {
  async getCustomerByProfileId(profileId: string): Promise<PortalCustomer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email, whatsapp, status, loyalty_points, registration_date')
      .eq('profile_id', profileId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      status: data.status,
      loyaltyPoints: data.loyalty_points,
      registeredAt: data.registration_date
    };
  },

  async getCustomerIdByProfileId(profileId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (error) throw new Error(error.message);
    return data?.id ?? null;
  },

  async getPetsForCustomer(customerId: string): Promise<PortalPet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('id, name, photo_url, species(name), breeds(name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      species: item.species?.name ?? 'Unknown',
      breed: item.breeds?.name ?? 'Unknown',
      photoUrl: item.photo_url ?? null
    }));
  },

  async getUpcomingAppointments(customerId: string): Promise<PortalAppointment[]> {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('appointments')
      .select('id, appointment_date, start_time, end_time, status, services(name), doctors(profiles(full_name))')
      .eq('customer_id', customerId)
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .limit(10);

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.id,
      service: item.services?.name ?? 'Service',
      appointmentDate: item.appointment_date,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      doctorName: item.doctors?.profiles?.full_name ?? null
    }));
  },

  async getInvoicesForCustomer(customerId: string): Promise<PortalInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, total, status, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);

    return (data || []).map((invoice: any) => ({
      id: invoice.id,
      total: Number(invoice.total ?? 0),
      status: invoice.status,
      createdAt: invoice.created_at
    }));
  },

  async getPortalSummary(customerId: string): Promise<PortalSummary> {
    const [petResult, appointmentResult, invoiceResult] = await Promise.all([
      supabase.from('pets').select('id', { count: 'exact' }).eq('customer_id', customerId),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('customer_id', customerId),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('customer_id', customerId)
    ]);

    if (petResult.error) throw new Error(petResult.error.message);
    if (appointmentResult.error) throw new Error(appointmentResult.error.message);
    if (invoiceResult.error) throw new Error(invoiceResult.error.message);

    return {
      petCount: petResult.count ?? 0,
      appointmentCount: appointmentResult.count ?? 0,
      invoiceCount: invoiceResult.count ?? 0
    };
  }
};
