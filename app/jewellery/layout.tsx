import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `Jewellery Collection — ${brandName}`,
    description:
      'Browse our complete collection of luxury jewellery including rings, necklaces, earrings, bracelets, pendants, and bridal pieces. Filter by category, metal, and stone.',
    alternates: { canonical: '/jewellery' },
    openGraph: {
      title: `Jewellery Collection — ${brandName}`,
      description: 'Browse our complete collection of luxury jewellery. Rings, necklaces, earrings, bracelets, and more.',
      type: 'website',
      url: `${SITE_URL}/jewellery`,
      siteName: brandName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Jewellery Collection — ${brandName}`,
      description: 'Browse our complete collection of luxury jewellery. Rings, necklaces, earrings, bracelets, and more.',
    },
    robots: { index: true, follow: true },
  };
}

export default function JewelleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
