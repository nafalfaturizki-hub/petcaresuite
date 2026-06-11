import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalAppointments, usePortalCustomerId } from '../portal.hooks';

export default function PortalAppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const appointmentsQuery = usePortalAppointments(customerIdQuery.data ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="My Appointments" description="Review upcoming appointments and visit details." />
      <div className="grid gap-4">
        {appointmentsQuery.data?.length ? (
          appointmentsQuery.data.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-slate-500">{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                  <h2 className="text-lg font-semibold">{appointment.service}</h2>
                  <p className="text-sm text-slate-500">{appointment.startTime} - {appointment.endTime}</p>
                </div>
                <div className="text-sm text-slate-600">{appointment.doctorName ? `Doctor: ${appointment.doctorName}` : 'Doctor not assigned yet'}</div>
              </div>
              <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{appointment.status}</div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-slate-600">No upcoming appointments found. Check back later or contact the clinic to book a visit.</Card>
        )}
      </div>
    </div>
  );
}
