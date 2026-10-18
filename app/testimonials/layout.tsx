import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `Customer Reviews & Testimonials — ${brandName}`,
    description:
      `Read genuine reviews from ${brandName} customers. Discover why clients trust us for their fine jewellery, engagement rings, and bespoke pieces.`,
    alternates: { canonical: '/testimonials' },
    openGraph: {
      title: `Customer Reviews & Testimonials — ${brandName}`,
      description:
        `Read genuine reviews from ${brandName} customers about their fine jewellery and bespoke pieces.`,
      type: 'website',
      siteName: brandName,
      url: '/testimonials',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Customer Reviews & Testimonials — ${brandName}`,
      description: `Read genuine reviews from ${brandName} customers.`,
    },
    robots: { index: true, follow: true },
  };
}

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
