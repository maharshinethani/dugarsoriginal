import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const SITE_URL = siteConfig.url;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  return {
    title: `Book an Appointment — ${brandName}`,
    description:
      `Book a private appointment with ${brandName}. Choose an in-store, virtual, or WhatsApp consultation with our jewellery experts.`,
    alternates: { canonical: '/appointment' },
    openGraph: {
      title: `Book an Appointment — ${brandName}`,
      description: 'Private appointments — in-store, virtual, or WhatsApp consultation.',
      type: 'website',
      url: `${SITE_URL}/appointment`,
      siteName: brandName,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book an Appointment — ${brandName}`,
      description: 'Private appointments — in-store, virtual, or WhatsApp consultation.',
    },
    robots: { index: true, follow: true },
  };
}

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
