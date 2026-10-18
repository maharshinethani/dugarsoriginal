import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `About Us — ${brandName}`,
    description:
      seo.taglineEn ||
      `Discover the ${brandName} story — our heritage, philosophy, and commitment to crafting timeless jewellery with the finest materials and master craftsmanship.`,
    alternates: { canonical: '/about' },
    openGraph: {
      title: `About Us — ${brandName}`,
      description: seo.taglineEn || `The ${brandName} story — heritage, philosophy, and the art of timeless jewellery.`,
      type: 'website',
      url: `${SITE_URL}/about`,
      siteName: brandName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `About Us — ${brandName}`,
      description: seo.taglineEn || `The ${brandName} story — heritage, philosophy, and the art of timeless jewellery.`,
    },
    robots: { index: true, follow: true },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
