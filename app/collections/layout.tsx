import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `Collections — ${brandName}`,
    description:
      'Explore our curated jewellery collections — signature, bridal, bespoke, and limited edition pieces designed for every occasion and taste.',
    alternates: { canonical: '/collections' },
    openGraph: {
      title: `Collections — ${brandName}`,
      description: 'Curated jewellery collections designed for every occasion and taste.',
      type: 'website',
      url: `${SITE_URL}/collections`,
      siteName: brandName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Collections — ${brandName}`,
      description: 'Curated jewellery collections designed for every occasion and taste.',
    },
    robots: { index: true, follow: true },
  };
}

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
