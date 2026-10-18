import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/jewellery`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/appointment`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/care-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (products) {
      productPages = products.map((p) => ({
        url: `${base}/jewellery/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch {
    // ignore — static pages still returned
  }

  let collectionPages: MetadataRoute.Sitemap = [];
  try {
    const { data: collections } = await supabase
      .from('collections')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (collections) {
      collectionPages = collections.map((c) => ({
        url: `${base}/collections/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // ignore
  }

  return [...staticPages, ...productPages, ...collectionPages];
}
