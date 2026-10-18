import type { Metadata } from 'next';
import AdminClient from './admin-client';
import { getSeoSettings } from '@/lib/seo-settings';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || 'DUGARS JEWELLERY';
  return {
    title: {
      default: `Admin — ${brandName}`,
      template: `Admin — %s | ${brandName}`,
    },
    robots: { index: false, follow: false },
    icons: {
      icon: [{ url: '/favicon' }],
      shortcut: [{ url: '/favicon' }],
    },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClient>{children}</AdminClient>;
}
