import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petshopService } from './petshop.service';
import type { ProductQueryParams, ProductPayload, ProductVariantPayload, ProductUpdatePayload } from './petshop.types';

export function useProductCategories() {
  return useQuery(['productCategories'], () => petshopService.getProductCategories());
}

export function useBrands() {
  return useQuery(['brands'], () => petshopService.getBrands());
}

export function useProducts(params: ProductQueryParams) {
  return useQuery(['products', params], () => petshopService.getProducts(params), { keepPreviousData: true });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation((payload: ProductPayload) => petshopService.createProduct(payload), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}

export function useCreateProductVariant() {
  const qc = useQueryClient();
  return useMutation((payload: ProductVariantPayload) => petshopService.createProductVariant(payload), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}

export function useProduct(id?: string | null) {
  return useQuery(['product', id], () => (id ? petshopService.getProductById(id) : Promise.resolve(null as any)), { enabled: Boolean(id) });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation(({ id, payload }: { id: string; payload: ProductUpdatePayload }) => petshopService.updateProduct(id, payload), {
    onSuccess: (_data, variables) => {
      qc.invalidateQueries(['products']);
      qc.invalidateQueries(['product', variables.id]);
    }
  });
}

export function useUpdateVariantStock() {
  const qc = useQueryClient();
  return useMutation(({ id, stock }: { id: string; stock: number }) => petshopService.updateVariantStock(id, stock), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation(({ id, updates }: { id: string; updates: any }) => petshopService.updateVariant(id, updates), {
    onSuccess: () => qc.invalidateQueries(['products'])
  });
}
