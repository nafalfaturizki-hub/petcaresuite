import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appointmentsService } from '../appointments.service';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn();
  return { supabase: { from, functions: { invoke: vi.fn() } } };
});

vi.mock('@/features/pos/pos.service', () => ({
  posService: { createInvoice: vi.fn() }
}));

describe('appointmentsService', () => {
  let supabaseMock: any;

  beforeEach(async () => {
    const mod = await import('@/lib/supabase');
    supabaseMock = mod.supabase;
    supabaseMock.from = vi.fn();
    supabaseMock.functions.invoke = vi.fn();
  });

  describe('getAppointments', () => {
    it('returns paginated appointments', async () => {
      const mockData = [{
        id: 'a1', customer_id: 'c1', pet_id: 'p1', doctor_id: 'd1', service_id: 's1',
        services: { name: 'Consult' }, customers: { full_name: 'John' }, pets: { name: 'Max' },
        doctors: { profiles: { full_name: 'Dr. Smith' } },
        appointment_date: '2026-06-15', start_time: '09:00:00', end_time: '10:00:00',
        status: 'scheduled', created_at: '2026-06-10T00:00:00Z'
      }];
      const range = vi.fn().mockResolvedValue({ data: mockData, count: 1, error: null });
      const order = vi.fn(() => ({ range }));
      const lte = vi.fn(() => ({ order }));
      const gte = vi.fn(() => ({ lte }));
      const eq = vi.fn(() => ({ gte }));
      const or = vi.fn(() => ({ range }));
      const ilike = vi.fn(() => ({ or }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order: vi.fn(() => ({ eq, ilike, range })) })) });

      const result = await appointmentsService.getAppointments({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by status', async () => {
      const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
      const order = vi.fn(() => ({ range }));
      const eq = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order: vi.fn(() => ({ eq })) })) });

      const result = await appointmentsService.getAppointments({ status: 'completed' });
      expect(result.items).toEqual([]);
    });

    it('handles error gracefully', async () => {
      const range = vi.fn().mockResolvedValue({ data: null, count: 0, error: { message: 'DB Error', code: 'UNKNOWN' } });
      const order = vi.fn(() => ({ range }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order: vi.fn(() => ({ range })) })) });

      await expect(appointmentsService.getAppointments()).rejects.toThrow();
    });
  });

  describe('getAppointmentById', () => {
    it('returns appointment when found', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'a1', customer_id: 'c1', pet_id: 'p1', service_id: 's1', services: { name: 'Consult' }, status: 'scheduled', appointment_date: '2026-06-15', start_time: '09:00:00', end_time: '10:00:00', created_at: '2026-06-10T00:00:00Z' },
        error: null
      });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await appointmentsService.getAppointmentById('a1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('a1');
    });

    it('returns null when not found', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ select });

      const result = await appointmentsService.getAppointmentById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createAppointment', () => {
    it('creates appointment successfully', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ data: { queue_number: '20260615-001' } });
      const single = vi.fn().mockResolvedValue({
        data: { id: 'a1', customer_id: 'c1', pet_id: 'p1', service_id: 's1', services: { name: 'Consult' }, status: 'scheduled', appointment_date: '2026-06-15', start_time: '09:00:00', end_time: '10:00:00', created_at: '2026-06-10T00:00:00Z' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      const result = await appointmentsService.createAppointment({
        customerId: 'c1', petId: 'p1', serviceId: 's1', appointmentDate: '2026-06-15',
        startTime: '09:00:00', endTime: '10:00:00'
      });
      expect(result.id).toBe('a1');
    });

    it('throws on creation error', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ data: { queue_number: '20260615-001' } });
      const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed', code: 'UNKNOWN' } });
      const select = vi.fn(() => ({ single }));
      const insert = vi.fn(() => ({ select }));
      supabaseMock.from.mockReturnValue({ insert });

      await expect(appointmentsService.createAppointment({
        customerId: 'c1', petId: 'p1', serviceId: 's1', appointmentDate: '2026-06-15',
        startTime: '09:00:00', endTime: '10:00:00'
      })).rejects.toThrow();
    });
  });

  describe('updateAppointmentStatus', () => {
    it('updates status successfully', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'a1', status: 'completed', appointment_date: '2026-06-15', start_time: '09:00:00', end_time: '10:00:00', created_at: '2026-06-10T00:00:00Z' },
        error: null
      });
      const select = vi.fn(() => ({ single }));
      const eq = vi.fn(() => ({ select }));
      const update = vi.fn(() => ({ eq }));
      supabaseMock.from.mockReturnValue({ update });

      const limit = vi.fn().mockResolvedValue({ data: [], error: null });
      const select2 = vi.fn(() => ({ limit }));
      const eq2 = vi.fn(() => ({ select2 }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ eq: vi.fn(() => ({ limit })) })) });

      const result = await appointmentsService.updateAppointmentStatus('a1', 'completed');
      expect(result.status).toBe('completed');
    });
  });

  describe('generateQueueNumber', () => {
    it('generates queue number from edge function', async () => {
      supabaseMock.functions.invoke.mockResolvedValue({ data: { queue_number: '20260615-001' } });
      const result = await appointmentsService.generateQueueNumber('2026-06-15');
      expect(result).toBe('20260615-001');
    });

    it('falls back to local generation on failure', async () => {
      supabaseMock.functions.invoke.mockRejectedValue(new Error('Function error'));
      const result = await appointmentsService.generateQueueNumber('2026-06-15');
      expect(result).toMatch(/^\d{8}-\d{3}$/);
    });
  });

  describe('getDoctorAvailability', () => {
    it('returns available slots', async () => {
      const scheduleData = { data: [{ start_time: '08:00:00', end_time: '12:00:00' }], error: null };
      const bookedData = { data: [{ start_time: '09:00:00' }], error: null };

      const schedulePromise = Promise.resolve(scheduleData);
      const bookedPromise = Promise.resolve(bookedData);

      supabaseMock.from.mockImplementation(() => ({
        select: vi.fn().mockImplementation(() => ({
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn().mockImplementation(() => ({
              eq: vi.fn().mockResolvedValue(scheduleData),
              neq: vi.fn().mockResolvedValue(bookedData)
            })),
            neq: vi.fn().mockResolvedValue(bookedData)
          }))
        }))
      }));

      const result = await appointmentsService.getDoctorAvailability('d1', '2026-06-15', 60);
      expect(result.doctorId).toBe('d1');
      expect(result.slots.length).toBeGreaterThan(0);
    });
  });

  describe('getServices', () => {
    it('returns services list', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 's1', name: 'Consult', duration_minutes: 60, price: 150000 }],
        error: null
      });
      const ilike = vi.fn(() => ({ order }));
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order: vi.fn(() => ({ ilike })) })) });

      const result = await appointmentsService.getServices('Consult');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Consult');
    });
  });

  describe('getDoctors', () => {
    it('returns doctors list', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 'd1', profile_id: 'p1', specialization: 'General', profiles: { full_name: 'Dr. Smith' } }],
        error: null
      });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await appointmentsService.getDoctors();
      expect(result).toHaveLength(1);
      expect(result[0].fullName).toBe('Dr. Smith');
    });

    it('filters doctors by search', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [
          { id: 'd1', profile_id: 'p1', specialization: 'General', profiles: { full_name: 'Dr. Smith' } },
          { id: 'd2', profile_id: 'p2', specialization: 'Dental', profiles: { full_name: 'Dr. Jones' } }
        ],
        error: null
      });
      supabaseMock.from.mockReturnValue({ select: vi.fn(() => ({ order })) });

      const result = await appointmentsService.getDoctors('Smith');
      expect(result).toHaveLength(1);
    });
  });
});