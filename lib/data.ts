import { supabaseServer as supabase } from '@/lib/supabase-server';
import type { Product, Category, Collection, WebsiteSettings } from '@/lib/types';

export {
  formatPrice,
  getDisplayName,
  getProductPrice,
  convertPrice,
  getProductDisplayPrice,
  formatDisplayPrice,
} from '@/lib/format';

export async function getProducts(opts?: {
  category?: string;
  collectionSlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  limit?: number;
  status?: 'draft' | 'published';
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, collection:collection_id(*), product_images(*)')
    .order('created_at', { ascending: false });

  if (opts?.status) query = query.eq('status', opts.status);
  else query = query.eq('status', 'published');

  if (opts?.category) query = query.eq('category', opts.category);
  if (opts?.featured) query = query.eq('is_featured', true);
  if (opts?.bestseller) query = query.eq('is_bestseller', true);
  if (opts?.newArrival) query = query.eq('is_new_arrival', true);
  if (opts?.limit) query = query.limit(opts.limit);

  let { data, error } = await query;

  if (opts?.collectionSlug && data) {
    const { data: col } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', opts.collectionSlug)
      .maybeSingle();
    if (col) {
      data = data.filter((p) => p.collection_id === col.id);
    }
  }

  if (error) return [];
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, collection:collection_id(*), product_images(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return null;
  return data as Product;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) return [];
  return (data as Category[]) || [];
}

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) return [];
  return (data as Collection[]) || [];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data as Collection;
}

export async function getWebsiteSettings(): Promise<WebsiteSettings | null> {
  const { data, error } = await supabase
    .from('website_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return null;
  return data as WebsiteSettings;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const filters: string[] = [];
  if (product.category) filters.push(`category.eq.${product.category}`);
  if (product.collection_id) filters.push(`collection_id.eq.${product.collection_id}`);

  if (filters.length === 0) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('status', 'published')
      .neq('id', product.id)
      .limit(limit);
    if (error || !data) return [];
    return (data as Product[]) || [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'published')
    .neq('id', product.id)
    .or(filters.join(','))
    .limit(limit);

  if (error || !data) return [];
  return (data as Product[]) || [];
}
