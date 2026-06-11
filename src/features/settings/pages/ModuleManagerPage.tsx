import { useMemo, useState } from 'react';
import { ShieldCheck, HeartPulse, Scissors, Package, Box, Wallet, Users, Stethoscope, CalendarDays, Home } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Switch, Alert } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useModules, useToggleModule } from '../settings.hooks';
import type { ModuleRecord } from '../settings.types';

const MODULE_INFO: Record<string, { icon: typeof Home; description: string }> = {
  clinic: { icon: Home, description: 'Core clinic operations, customers, pets, and appointments.' },
  monitoring: { icon: HeartPulse, description: 'Track pet observations and wellness monitoring.' },
  inpatient: { icon: ShieldCheck, description: 'Manage inpatient ward and animal stays.' },
  grooming: { icon: Scissors, description: 'Book and manage grooming services.' },
  petshop: { icon: Package, description: 'Sell products and manage petshop inventory.' },
  inventory: { icon: Box, description: 'Track stock levels and supplies.' },
  accounting: { icon: Wallet, description: 'Process sales, invoices, and accounting data.' },
  website: { icon: Users, description: 'Manage website content and public pages.' }
};

const DEPENDENCIES: Record<string, string[]> = {
  accounting: ['inventory'],
  petshop: ['inventory'],
  inpatient: ['clinic'],
  grooming: ['clinic'],
  monitoring: ['clinic']
};

function getDependentWarnings(modules: ModuleRecord[], key: string) {
  const dependents = Object.entries(DEPENDENCIES)
    .filter(([, deps]) => deps.includes(key))
    .map(([moduleKey]) => moduleKey);

  return dependents.filter((moduleKey) => {
    const moduleRecord = modules.find((module) => module.key === moduleKey);
    return moduleRecord?.is_enabled;
  });
}

export default function ModuleManagerPage() {
  useDocumentTitle('Module Manager');
  const { data: modules = [], isLoading } = useModules();
  const toggleModule = useToggleModule();
  const [optimisticState, setOptimisticState] = useState<Record<string, boolean>>({});

  const moduleList = useMemo(
    () => modules.map((module) => ({
      ...module,
      icon: MODULE_INFO[module.key]?.icon ?? Home,
      description: MODULE_INFO[module.key]?.description ?? 'Manage module features.'
    })),
    [modules]
  );

  const getEnabled = (key: string) => optimisticState[key] ?? modules.find((module) => module.key === key)?.is_enabled;

  return (
    <div className="space-y-6">
      <PageHeader title="Module Manager" description="Enable or disable PetCare Suite modules." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {moduleList.map((module) => {
          const enabled = getEnabled(module.key);
          const warnings = !enabled ? getDependentWarnings(modules, module.key) : [];

          return (
            <Card key={module.key} className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <module.icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{module.name}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">Enabled</p>
                <Switch
                  checked={Boolean(enabled)}
                  onCheckedChange={(value) => {
                    const currentState = getEnabled(module.key);
                    setOptimisticState((state) => ({ ...state, [module.key]: value }));
                    toggleModule.mutate(
                      { key: module.key, isEnabled: value },
                      {
                        onError: () => setOptimisticState((state) => ({ ...state, [module.key]: currentState }))
                      }
                    );
                  }}
                />
              </div>
              {warnings.length > 0 && (
                <Alert variant="warning">
                  Disabling this module may affect: {warnings.join(', ')}.
                </Alert>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
