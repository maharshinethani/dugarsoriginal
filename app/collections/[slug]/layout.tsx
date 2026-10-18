import type { Metadata } from 'next';
import { cache } from 'react';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

const getCollectionForMetadata = cache(async (slug: string) => {
  const { data } = await supabase
    .from('collections')
    .select('name_en, name_ar, slug, description_en, seo_title_en, seo_description_en, hero_image_url, is_published')
    .eq('slug', slug)
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [collection, seo] = await Promise.all([
    getCollectionForMetadata(params.slug),
    getSeoSettings(),
  ]);

  const brandName = seo.brandName || siteConfig.brand.fullName;

  if (!collection) {
    return {
      title: 'Collection Not Found',
      robots: { index: false, follow: true },
    };
  }

  const title = collection.seo_title_en || `${collection.name_en} Collection — ${brandName}`;
  const description = collection.seo_description_en || collection.description_en || `Explore the ${collection.name_en} collection at ${brandName}.`;
  const image = collection.hero_image_url || undefined;
  const canonicalUrl = `${SITE_URL}/collections/${collection.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: brandName,
      ...(image && { images: [{ url: image, alt: collection.name_en }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
    robots: {
      index: collection.is_published,
      follow: true,
    },
  };
}

export default async function CollectionDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const collection = await getCollectionForMetadata(params.slug);

  const breadcrumbLd = collection
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE_URL}/collections` },
          { '@type': 'ListItem', position: 3, name: collection.name_en, item: `${SITE_URL}/collections/${collection.slug}` },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      {children}
    </>
  );
}
