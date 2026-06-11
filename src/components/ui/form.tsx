import * as React from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';

export type UseFormOptions<T> = Parameters<typeof useReactHookForm<T>>[0];

export function useForm<TFormValues extends Record<string, any>>(options?: UseFormOptions<TFormValues>) {
  return useReactHookForm<TFormValues>(options);
}

export * from 'react-hook-form';
