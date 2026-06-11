import * as React from 'react';
import { Badge } from '@/components/ui';

interface StatusBadgeProps {
  value: string;
  variantMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' }>;
}

export function StatusBadge({ value, variantMap }: StatusBadgeProps) {
  const status = variantMap[value] ?? { label: value, variant: 'default' };

  return <Badge variant={status.variant}>{status.label}</Badge>;
}
