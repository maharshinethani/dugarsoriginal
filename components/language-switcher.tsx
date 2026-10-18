'use client';

import { useLocale } from '@/lib/locale-context';
import { Globe } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'en' ? 'ar' : 'en';
    setLocale(newLocale);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-full border border-border p-2 sm:px-2.5 sm:py-1 text-[10px] font-medium tracking-wider text-foreground/70 transition-colors hover:border-white/50 hover:text-gold"
      aria-label="Language switcher"
    >
      <Globe className="h-4 w-4 sm:h-3 sm:w-3" />
      <span className="hidden sm:inline">
        {locale === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
}