import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalPets, usePortalCustomerId } from '../portal.hooks';

export default function PortalPetsPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const petsQuery = usePortalPets(customerIdQuery.data ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="My Pets" description="View your pets and their basic profiles." />
      <div className="grid gap-6 lg:grid-cols-3">
        {petsQuery.data?.length ? (
          petsQuery.data.map((pet) => (
            <Card key={pet.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800" />
                <div>
                  <h2 className="text-lg font-semibold">{pet.name}</h2>
                  <p className="text-sm text-slate-500">{pet.species} / {pet.breed}</p>
                  <Link to={`/staff/pets/${pet.id}`} className="mt-3 inline-flex text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300">View profile</Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-slate-600">No pets found. Contact the clinic to register a pet.</Card>
        )}
      </div>
    </div>
  );
}
