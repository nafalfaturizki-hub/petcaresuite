import { supabase } from '@/lib/supabase';
import type {
  Product,
  ProductVariant,
  ProductQueryParams,
  ProductPayload,
  ProductVariantPayload,
  ProductCategory,
  Brand,
  ProductImage,
  ProductUpdatePayload,
  ProductVariantUpdatePayload
} from './petshop.types';

function mapCategory(record: any): ProductCategory {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    createdAt: record.created_at
  };
}

function mapBrand(record: any): Brand {
  return {
    id: record.id,
    name: record.name,
    createdAt: record.created_at
  };
}

function mapVariant(record: any): ProductVariant {
  return {
    id: record.id,
    productId: record.product_id,
    name: record.name,
    size: record.size,
    weight: Number(record.weight),
    color: record.color,
    price: Number(record.price),
    stock: record.stock,
    createdAt: record.created_at
  };
}

function mapProduct(record: any): Product {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    categoryId: record.category_id,
    brandId: record.brand_id,
    sku: record.sku,
    barcode: record.barcode,
    basePrice: Number(record.base_price),
    isActive: record.is_active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    variants: Array.isArray(record.variants) ? record.variants.map(mapVariant) : [],
    images: Array.isArray(record.product_images) ? record.product_images.map((img: any) => ({
      id: img.id,
      productId: img.product_id,
      url: img.url,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order,
      createdAt: img.created_at
    })) : []
  };
}

export const petshopService = {
  async getProductCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase.from('product_categories').select('id, name, slug, created_at').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapCategory);
  },

  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase.from('brands').select('id, name, created_at').order('name');
    if (error) throw new Error(error.message);
    return (data || []).map(mapBrand);
  },

  async getProducts(params: ProductQueryParams = {}): Promise<{ items: Product[]; total: number }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const offset = (page - 1) * pageSize;
    let query: any = supabase
      .from('products')
      .select('id, name, slug, description, category_id, brand_id, sku, barcode, base_price, is_active, created_at, updated_at, variants(*)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.categoryId) query = query.eq('category_id', params.categoryId);
    if (params.brandId) query = query.eq('brand_id', params.brandId);

    const res = await query.range(offset, offset + pageSize - 1);
    if (res.error) throw new Error(res.error.message);
    const items = Array.isArray(res.data) ? res.data.map(mapProduct) : [];
    return { items, total: typeof res.count === 'number' ? res.count : items.length };
  },

  async createProduct(payload: ProductPayload & { variants?: ProductVariantPayload[]; images?: File[] | Array<{ url: string }> }): Promise<Product> {
    const { data, error } = await supabase.from('products').insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      category_id: payload.categoryId,
      brand_id: payload.brandId,
      sku: payload.sku,
      barcode: payload.barcode,
      base_price: payload.basePrice
    }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create product');
    const product = mapProduct({ ...data, variants: [] });

    // insert variants
    if (Array.isArray(payload.variants) && payload.variants.length) {
      const rows = payload.variants.map((v) => ({
        product_id: product.id,
        name: v.name,
        size: v.size,
        weight: v.weight,
        color: v.color,
        price: v.price,
        stock: v.stock
      }));
      const { data: variantData, error: variantError } = await supabase.from('product_variants').insert(rows).select();
      if (variantError) throw new Error(variantError.message);
      product.variants = Array.isArray(variantData) ? variantData.map(mapVariant) : [];
    }

    // upload images
    if (Array.isArray(payload.images) && payload.images.length) {
      for (const img of payload.images as any[]) {
        if (img instanceof File) {
          const path = `products/${product.id}/${Date.now()}-${img.name}`;
          const { error: uploadError } = await supabase.storage.from('petshop-images').upload(path, img, { cacheControl: '3600', upsert: true });
          if (uploadError) throw new Error(uploadError.message);
          const { data: urlData, error: urlError } = await supabase.storage.from('petshop-images').createSignedUrl(path, 60 * 60);
          if (urlError || !urlData?.signedURL) throw new Error(urlError?.message || 'Unable to generate image url');
          const { data: imgRow } = await supabase.from('product_images').insert({ product_id: product.id, url: urlData.signedURL }).select().single();
          product.images = product.images ?? [];
          product.images.push({ id: imgRow.id, productId: imgRow.product_id, url: imgRow.url, isPrimary: imgRow.is_primary, sortOrder: imgRow.sort_order, createdAt: imgRow.created_at });
        } else if (img && img.url) {
          const { data: imgRow } = await supabase.from('product_images').insert({ product_id: product.id, url: img.url }).select().single();
          product.images = product.images ?? [];
          product.images.push({ id: imgRow.id, productId: imgRow.product_id, url: imgRow.url, isPrimary: imgRow.is_primary, sortOrder: imgRow.sort_order, createdAt: imgRow.created_at });
        }
      }
    }

    return product;
  },

  async createProductVariant(payload: ProductVariantPayload): Promise<ProductVariant> {
    const { data, error } = await supabase.from('product_variants').insert({
      product_id: payload.productId,
      name: payload.name,
      size: payload.size,
      weight: payload.weight,
      color: payload.color,
      price: payload.price,
      stock: payload.stock
    }).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to create product variant');
    return mapVariant(data);
  }
,

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, description, category_id, brand_id, sku, barcode, base_price, is_active, created_at, updated_at, variants(*), product_images(*)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data ? mapProduct(data) : null;
  },

  async updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
    const transformed: any = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.categoryId !== undefined ? { category_id: payload.categoryId } : {}),
      ...(payload.brandId !== undefined ? { brand_id: payload.brandId } : {}),
      ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
      ...(payload.barcode !== undefined ? { barcode: payload.barcode } : {}),
      ...(payload.basePrice !== undefined ? { base_price: payload.basePrice } : {}),
      ...(payload.isActive !== undefined ? { is_active: payload.isActive } : {})
    };

    const { data, error } = await supabase.from('products').update(transformed).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update product');
    const product = mapProduct({ ...data, variants: [] });

    if (Array.isArray(payload.variants)) {
      for (const v of payload.variants) {
        if ((v as any).id) {
          const vid = (v as any).id as string;
          const { error: uErr } = await supabase.from('product_variants').update({
            ...(v.name !== undefined ? { name: v.name } : {}),
            ...(v.size !== undefined ? { size: v.size } : {}),
            ...(v.weight !== undefined ? { weight: v.weight } : {}),
            ...(v.color !== undefined ? { color: v.color } : {}),
            ...(v.price !== undefined ? { price: v.price } : {}),
            ...(v.stock !== undefined ? { stock: v.stock } : {})
          }).eq('id', vid);
          if (uErr) throw new Error(uErr.message);
        } else {
          const { data: newVar, error: varErr } = await supabase.from('product_variants').insert({
            product_id: id,
            name: (v as any).name || 'Variant',
            size: (v as any).size,
            weight: (v as any).weight,
            color: (v as any).color,
            price: (v as any).price || 0,
            stock: (v as any).stock || 0
          }).select().single();
          if (varErr) throw new Error(varErr.message);
        }
      }
    }

    if (Array.isArray(payload.images) && payload.images.length) {
      for (const img of payload.images as any[]) {
        if (img instanceof File) {
          const path = `products/${id}/${Date.now()}-${img.name}`;
          const { error: uploadError } = await supabase.storage.from('petshop-images').upload(path, img, { cacheControl: '3600', upsert: true });
          if (uploadError) throw new Error(uploadError.message);
          const { data: urlData, error: urlError } = await supabase.storage.from('petshop-images').createSignedUrl(path, 60 * 60);
          if (urlError || !urlData?.signedURL) throw new Error(urlError?.message || 'Unable to generate image url');
          await supabase.from('product_images').insert({ product_id: id, url: urlData.signedURL });
        } else if (img && img.url) {
          await supabase.from('product_images').insert({ product_id: id, url: img.url });
        }
      }
    }

    return (await this.getProductById(id)) as Product;
  },

  async updateVariant(id: string, updates: ProductVariantUpdatePayload): Promise<ProductVariant> {
    const transformed: any = {
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.size !== undefined ? { size: updates.size } : {}),
      ...(updates.weight !== undefined ? { weight: updates.weight } : {}),
      ...(updates.color !== undefined ? { color: updates.color } : {}),
      ...(updates.price !== undefined ? { price: updates.price } : {}),
      ...(updates.stock !== undefined ? { stock: updates.stock } : {})
    };
    const { data, error } = await supabase.from('product_variants').update(transformed).eq('id', id).select().single();
    if (error || !data) throw new Error(error?.message || 'Unable to update variant');
    return mapVariant(data);
  },

  async updateVariantStock(id: string, stock: number): Promise<boolean> {
    const { error } = await supabase.from('product_variants').update({ stock }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
};