'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { WebsiteSettings, ContactEmail, ContactPhone, WhatsAppNumber } from '@/lib/types';
import { siteConfig } from '@/lib/site-config';

interface SettingsContextValue {
  settings: WebsiteSettings | null;
  loading: boolean;
  whatsappNumber: string;
  contactEmails: ContactEmail[];
  contactPhones: ContactPhone[];
  whatsappNumbers: WhatsAppNumber[];
  primaryEmail: string | null;
  primaryPhone: string | null;
  primaryWhatsapp: string | null;
  getWhatsappForPurpose: (purpose: 'product_enquiry' | 'buy_now' | 'general' | 'order') => string | null;
  refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const defaultSettings: WebsiteSettings = {
  id: 1,
  brand_name: siteConfig.brand.name,
  logo_url: null,
  favicon_url: null,
  whatsapp_number: siteConfig.whatsappDefault,
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address_en: siteConfig.contact.address.en,
  address_ar: siteConfig.contact.address.ar,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  pinterest: siteConfig.social.pinterest,
  youtube: siteConfig.social.youtube,
  google_maps_url: null,
  currency: siteConfig.currency,
  default_language: 'en',
  announcement_bar_enabled: true,
  show_prices: false,
  tagline_en: null,
  tagline_ar: null,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [contactEmails, setContactEmails] = useState<ContactEmail[]>([]);
  const [contactPhones, setContactPhones] = useState<ContactPhone[]>([]);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumber[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as WebsiteSettings);
      } else {
        setSettings(defaultSettings);
      }

      const [emailsRes, phonesRes, waRes] = await Promise.all([
        supabase.from('contact_emails').select('*').order('display_order', { ascending: true }),
        supabase.from('contact_phones').select('*').order('display_order', { ascending: true }),
        supabase.from('whatsapp_numbers').select('*').order('display_order', { ascending: true }),
      ]);

      if (emailsRes.data) setContactEmails(emailsRes.data as ContactEmail[]);
      if (phonesRes.data) setContactPhones(phonesRes.data as ContactPhone[]);
      if (waRes.data) setWhatsappNumbers(waRes.data as WhatsAppNumber[]);
    } catch {
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const whatsappNumber = settings?.whatsapp_number || defaultSettings.whatsapp_number;

  const enabledEmails = contactEmails.filter((e) => e.is_enabled);
  const enabledPhones = contactPhones.filter((p) => p.is_enabled);
  const enabledWhatsapp = whatsappNumbers.filter((w) => w.is_enabled);

  const primaryEmail = enabledEmails.find((e) => e.is_primary)?.email || enabledEmails[0]?.email || settings?.email || null;
  const primaryPhone = enabledPhones.find((p) => p.is_primary)?.phone || enabledPhones[0]?.phone || settings?.phone || null;
  const primaryWhatsapp = enabledWhatsapp.find((w) => w.is_primary)?.number || enabledWhatsapp[0]?.number || whatsappNumber || null;

  const getWhatsappForPurpose = useCallback(
    (purpose: 'product_enquiry' | 'buy_now' | 'general' | 'order'): string | null => {
      const purposeKey = `purpose_${purpose}` as keyof WhatsAppNumber;
      const purposeMatch = enabledWhatsapp.find((w) => w[purposeKey] === true);
      if (purposeMatch) return purposeMatch.number;
      return primaryWhatsapp;
    },
    [enabledWhatsapp, primaryWhatsapp]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        whatsappNumber,
        contactEmails,
        contactPhones,
        whatsappNumbers,
        primaryEmail,
        primaryPhone,
        primaryWhatsapp,
        getWhatsappForPurpose,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
