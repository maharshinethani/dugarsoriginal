import { cache } from 'react';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { siteConfig } from '@/lib/site-config';

export interface SeoSettings {
  brandName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  taglineEn: string | null;
  taglineAr: string | null;
  phone: string | null;
  email: string | null;
  addressEn: string | null;
  addressAr: string | null;
  instagram: string | null;
  facebook: string | null;
  pinterest: string | null;
  youtube: string | null;
  googleMapsUrl: string | null;
  showPrices: boolean;
  currency: string;
  updatedAt: string | null;
}

const fallback: SeoSettings = {
  brandName: siteConfig.brand.fullName,
  logoUrl: null,
  faviconUrl: null,
  taglineEn: null,
  taglineAr: null,
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  addressEn: siteConfig.contact.address.en,
  addressAr: siteConfig.contact.address.ar,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  pinterest: siteConfig.social.pinterest,
  youtube: siteConfig.social.youtube,
  googleMapsUrl: null,
  showPrices: false,
  currency: siteConfig.currency,
  updatedAt: null,
};

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  try {
    const { data } = await supabase
      .from('website_settings')
      .select('brand_name, logo_url, favicon_url, tagline_en, tagline_ar, phone, email, address_en, address_ar, instagram, facebook, pinterest, youtube, google_maps_url, show_prices, currency, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (!data) return fallback;

    return {
      brandName: (data.brand_name as string) || fallback.brandName,
      logoUrl: data.logo_url ?? null,
      faviconUrl: data.favicon_url ?? null,
      taglineEn: data.tagline_en ?? null,
      taglineAr: data.tagline_ar ?? null,
      phone: data.phone || fallback.phone,
      email: data.email || fallback.email,
      addressEn: data.address_en || fallback.addressEn,
      addressAr: data.address_ar || fallback.addressAr,
      instagram: data.instagram || null,
      facebook: data.facebook || null,
      pinterest: data.pinterest || null,
      youtube: data.youtube || null,
      googleMapsUrl: data.google_maps_url || null,
      showPrices: data.show_prices ?? false,
      currency: data.currency || fallback.currency,
      updatedAt: (data.updated_at as string) || null,
    };
  } catch {
    return fallback;
  }
});

export async function getShowPrices(): Promise<boolean> {
  const seo = await getSeoSettings();
  return seo.showPrices;
}
