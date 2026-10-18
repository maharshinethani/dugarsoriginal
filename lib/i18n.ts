export type Locale = 'en' | 'ar';

export const locales: Locale[] = ['en', 'ar'];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  ar: 'العربية',
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'Arabic',
};

export const localeFlags: Record<Locale, string> = {
  en: 'EN',
  ar: 'AR',
};

export const isRTL = (locale: Locale): boolean => locale === 'ar';

export const localeDir = (locale: Locale): 'rtl' | 'ltr' =>
  isRTL(locale) ? 'rtl' : 'ltr';

export const localeLang = (locale: Locale): string => locale;
