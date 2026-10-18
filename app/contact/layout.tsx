import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `Contact Us — ${brandName}`,
    description:
      `Get in touch with ${brandName}. Visit our showroom, send us a message, or connect via WhatsApp for enquiries, appointments, and customer support.`,
    alternates: { canonical: '/contact' },
    openGraph: {
      title: `Contact Us — ${brandName}`,
      description: 'Visit our showroom, send a message, or connect via WhatsApp.',
      type: 'website',
      url: `${SITE_URL}/contact`,
      siteName: brandName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Contact Us — ${brandName}`,
      description: 'Visit our showroom, send a message, or connect via WhatsApp.',
    },
    robots: { index: true, follow: true },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
