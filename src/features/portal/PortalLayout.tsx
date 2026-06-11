import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

const navLinkClasses =
  'inline-flex items-center rounded-md border border-slate-200 bg-transparent px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800';

export default function PortalLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between max-w-6xl">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Customer Portal</div>
            <h1 className="text-2xl font-semibold">Welcome back, {user?.fullName ?? 'Customer'}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/portal" className={navLinkClasses}>Overview</Link>
            <Link to="/portal/pets" className={navLinkClasses}>Pets</Link>
            <Link to="/portal/appointments" className={navLinkClasses}>Appointments</Link>
            <Link to="/portal/invoices" className={navLinkClasses}>Invoices</Link>
            <Link to="/profile" className={navLinkClasses}>My Profile</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
