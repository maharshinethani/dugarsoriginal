import type { Metadata } from 'next';
import { cache } from 'react';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

const getProductForMetadata = cache(async (slug: string) => {
  const { data } = await supabase
    .from('products')
    .select('id, name_en, slug, short_description_en, seo_title_en, seo_description_en, thumbnail_url, price, sale_price, status, sku, material, metal, stone, category, collection_id, stock_status')
    .eq('slug', slug)
    .maybeSingle();
  return data;
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [product, seo] = await Promise.all([
    getProductForMetadata(params.slug),
    getSeoSettings(),
  ]);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: true },
    };
  }

  const brandName = seo.brandName || siteConfig.brand.fullName;
  const title = product.seo_title_en || `${product.name_en} — ${brandName}`;
  const description = product.seo_description_en || product.short_description_en || `Discover the ${product.name_en} at ${brandName}.`;
  const image = product.thumbnail_url || undefined;
  const canonicalUrl = `${SITE_URL}/jewellery/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: `/jewellery/${product.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: brandName,
      ...(image && { images: [{ url: image, alt: product.name_en }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
    robots: {
      index: product.status === 'published',
      follow: true,
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const [product, seo] = await Promise.all([
    getProductForMetadata(params.slug),
    getSeoSettings(),
  ]);

  if (!product || product.status !== 'published') {
    return <>{children}</>;
  }

  const brandName = seo.brandName || siteConfig.brand.fullName;
  const showPrices = seo.showPrices;

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.seo_title_en || product.name_en,
    url: `${SITE_URL}/jewellery/${product.slug}`,
    ...(product.thumbnail_url && { image: [product.thumbnail_url] }),
    ...(product.short_description_en && { description: product.short_description_en }),
    ...(product.sku && { sku: product.sku }),
    ...(product.material && { material: product.material }),
    ...(product.metal && { additionalType: product.metal }),
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
  };

  if (showPrices && product.price) {
    const availabilityMap: Record<string, string> = {
      in_stock: 'https://schema.org/InStock',
      low_stock: 'https://schema.org/LimitedAvailability',
      out_of_stock: 'https://schema.org/OutOfStock',
      made_to_order: 'https://schema.org/PreOrder',
    };
    productLd.offers = {
      '@type': 'Offer',
      url: `${SITE_URL}/jewellery/${product.slug}`,
      priceCurrency: seo.currency || 'USD',
      price: String(product.sale_price || product.price),
      availability: availabilityMap[product.stock_status] || 'https://schema.org/InStock',
    };
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jewellery', item: `${SITE_URL}/jewellery` },
      { '@type': 'ListItem', position: 3, name: product.name_en, item: `${SITE_URL}/jewellery/${product.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
