import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';

function OwnerDashboard() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Clinic Performance</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Review appointments, revenue, and active patients at a glance.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Staff Activity</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Monitor staff operations, task completion, and patient follow ups.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Operational Modules</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Configure clinic modules, inventory, sales, and reporting from one place.</p>
        </Card>
      </div>
    </>
  );
}

function DoctorDashboard() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Today&apos;s Appointments</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Keep track of scheduled visits and consultation times.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Medical Records</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Access case notes, lab results, and treatment plans quickly.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Patient Care</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Review follow ups, prescriptions, and inpatient observations.</p>
        </Card>
      </div>
    </>
  );
}

function StaffDashboard() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Schedule Overview</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">See upcoming appointments, grooming, and checkout tasks.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Billing & Invoices</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Track pending invoices, sales, and customer payments.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Customer Activity</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage customer visits, pet profiles, and service requests.</p>
        </Card>
      </div>
    </>
  );
}

function CustomerDashboard() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Welcome to PetCare</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">View your profile, appointments, and pet health updates in one place.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Pet Records</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Check vaccination history and medical summaries for your pets.</p>
        </Card>
        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Contact the clinic for appointments, grooming, or follow-up support.</p>
        </Card>
      </div>
    </>
  );
}

export function DashboardPage() {
  const role = useAuthStore((state) => state.role);

  const dashboardContent = useMemo(() => {
    switch (role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  }, [role]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Quick access to your PetCare Suite workspace and role-specific insights." />
      {dashboardContent}
      {role === 'owner' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Manage Modules</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Enable or disable features across clinic, inventory, petshop, and website.</p>
          </Card>
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">Review Reports</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Open financial reports and audit logs for recent system activity.</p>
          </Card>
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">System Settings</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Update clinic profile, invoice settings, and business hours.</p>
          </Card>
        </div>
      )}
    </div>
  );
}

