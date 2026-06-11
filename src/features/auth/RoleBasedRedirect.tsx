import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export default function RoleBasedRedirect() {
  const role = useAuthStore((s) => s.role);

  if (!role) return <Navigate to="/login" replace />;

  switch (role) {
    case 'owner':
      return <Navigate to="/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/medical-records" replace />;
    case 'staff':
      return <Navigate to="/staff/customers" replace />;
    case 'customer':
      return <Navigate to="/portal" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}
