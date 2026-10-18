import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, Noto_Kufi_Arabic } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { AnnouncementMarquee } from '@/components/announcement-marquee';
import { Footer } from '@/components/footer';
import { Preloader } from '@/components/preloader';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { siteConfig } from '@/lib/site-config';
import { getSeoSettings } from '@/lib/seo-settings';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const SITE_URL = siteConfig.url;

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  const verificationMeta: Record<string, string> = {};
  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verificationMeta['google-site-verification'] = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${brandName} | Official Jewellery`,
      template: `%s | ${brandName}`,
    },
    description:
      seo.taglineEn ||
      `Discover ${brandName} — rings, necklaces, earrings, bracelets, and bridal pieces crafted with the finest materials. Explore our official jewellery website.`,
    keywords: [
      brandName,
      'Dugars',
      `${brandName} official website`,
      'luxury jewellery',
      'diamond rings',
      'gold necklaces',
      'bridal jewellery',
      'bespoke jewellery',
    ],
    icons: {
      icon: [{ url: `/favicon${seo.updatedAt ? `?v=${encodeURIComponent(seo.updatedAt)}` : ''}` }],
      shortcut: [{ url: `/favicon${seo.updatedAt ? `?v=${encodeURIComponent(seo.updatedAt)}` : ''}` }],
      apple: [{ url: `/favicon${seo.updatedAt ? `?v=${encodeURIComponent(seo.updatedAt)}` : ''}` }],
    },
    openGraph: {
      title: `${brandName} | Official Jewellery`,
      description:
        seo.taglineEn ||
        `Discover ${brandName} — rings, necklaces, earrings, bracelets, and bridal pieces crafted with the finest materials.`,
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['ar_AR'],
      siteName: brandName,
      url: SITE_URL,
      ...(seo.logoUrl && { images: [{ url: seo.logoUrl, alt: brandName }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brandName} | Official Jewellery`,
      description:
        seo.taglineEn ||
        `Discover ${brandName} — rings, necklaces, earrings, bracelets, and bridal pieces.`,
      ...(seo.logoUrl && { images: [seo.logoUrl] }),
    },
    alternates: {
      canonical: '/',
      languages: {
        'en': '/',
        'ar': '/',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    ...(Object.keys(verificationMeta).length > 0 && { verification: verificationMeta }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const seo = await getSeoSettings();
  const brandName = seo.brandName || siteConfig.brand.fullName;

  const organizationLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: brandName,
    url: SITE_URL,
    description:
      seo.taglineEn || `Discover ${brandName} — rings, necklaces, earrings, bracelets, and bridal pieces crafted with the finest materials.`,
    sameAs: [
      seo.instagram,
      seo.facebook,
      seo.pinterest,
      seo.youtube,
    ].filter(Boolean) as string[],
  };

  if (seo.logoUrl) organizationLd.logo = seo.logoUrl;
  if (seo.email) organizationLd.email = seo.email;
  if (seo.phone) organizationLd.telephone = seo.phone;
  if (seo.addressEn) {
    organizationLd.address = {
      '@type': 'PostalAddress',
      streetAddress: seo.addressEn,
    };
  }
  if (seo.googleMapsUrl) {
    organizationLd.hasMap = seo.googleMapsUrl;
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brandName,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/jewellery?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} ${notoKufi.variable} font-sans antialiased`}>
        <Providers>
          <Preloader />
          <AnnouncementMarquee />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
