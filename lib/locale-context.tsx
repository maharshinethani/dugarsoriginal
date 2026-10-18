'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Locale, localeDir, localeLang } from '@/lib/i18n';
import { translations, TranslationKey } from '@/lib/translations';

interface LocaleContextValue {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = 'dugars-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'en' || stored === 'ar') {
      setLocaleState(stored);
    }
    setIsLoading(false);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = localeLang(locale);
      document.documentElement.dir = localeDir(locale);
    }
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[locale]?.[key] ?? translations.en[key] ?? key;
    },
    [locale]
  );

  const dir = localeDir(locale);

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale, t, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
