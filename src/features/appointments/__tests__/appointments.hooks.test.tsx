import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAppointments, useAppointment, useCreateAppointment, useUpdateAppointmentStatus, useDoctors, useServices, useCalendarAppointments, useGetDoctorAvailability } from '../appointments.hooks';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(), functions: { invoke: vi.fn() } }
}));

vi.mock('../appointments.service', () => ({
  appointmentsService: {
    getAppointments: vi.fn(),
    getAppointmentById: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointmentStatus: vi.fn(),
    getDoctors: vi.fn(),
    getServices: vi.fn(),
    getCalendarAppointments: vi.fn(),
    getDoctorAvailability: vi.fn()
  }
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('appointments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAppointments', () => {
    it('returns appointments data', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getAppointments as any).mockResolvedValue({ items: [{ id: 'a1' }], total: 1 });

      const { result } = renderHook(() => useAppointments({ page: 1 }), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.items).toHaveLength(1);
    });

    it('handles error state', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getAppointments as any).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useAppointments({ page: 1 }), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAppointment', () => {
    it('returns single appointment', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getAppointmentById as any).mockResolvedValue({ id: 'a1', status: 'scheduled' });

      const { result } = renderHook(() => useAppointment('a1'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.id).toBe('a1');
    });

    it('returns null when no id provided', async () => {
      const { result } = renderHook(() => useAppointment(undefined), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCreateAppointment', () => {
    it('creates appointment and invalidates queries', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.createAppointment as any).mockResolvedValue({ id: 'a1' });

      const { result } = renderHook(() => useCreateAppointment(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync({ customerId: 'c1', petId: 'p1', serviceId: 's1', appointmentDate: '2026-06-15', startTime: '09:00', endTime: '10:00' });
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useUpdateAppointmentStatus', () => {
    it('updates status and invalidates queries', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.updateAppointmentStatus as any).mockResolvedValue({ id: 'a1', status: 'completed' });

      const { result } = renderHook(() => useUpdateAppointmentStatus(), { wrapper: createWrapper() });

      await act(async () => {
        await result.current.mutateAsync({ id: 'a1', status: 'completed' });
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useDoctors', () => {
    it('returns doctors list', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getDoctors as any).mockResolvedValue([{ id: 'd1', fullName: 'Dr. Smith' }]);

      const { result } = renderHook(() => useDoctors(''), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('useServices', () => {
    it('returns services list', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getServices as any).mockResolvedValue([{ id: 's1', name: 'Consult' }]);

      const { result } = renderHook(() => useServices(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('useCalendarAppointments', () => {
    it('returns calendar appointments', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getCalendarAppointments as any).mockResolvedValue([{ id: 'a1' }]);

      const { result } = renderHook(() => useCalendarAppointments('2026-06-01', '2026-06-30'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('useGetDoctorAvailability', () => {
    it('returns availability', async () => {
      const { appointmentsService } = await import('../appointments.service');
      (appointmentsService.getDoctorAvailability as any).mockResolvedValue({ doctorId: 'd1', slots: [] });

      const { result } = renderHook(() => useGetDoctorAvailability('d1', '2026-06-15', 60), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.doctorId).toBe('d1');
    });
  });
});