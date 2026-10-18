'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useLocale } from '@/lib/locale-context';

export function CurrencySelector() {
  const { countries, currencies, selectedCountry, selectedCurrency, setCountry, setCurrency, loading } = useCurrency();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (loading || !selectedCountry || !selectedCurrency) return null;

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border/20 bg-card/95 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-heading shadow-md backdrop-blur-sm transition-all hover:border-gold hover:text-gold"
        aria-label={t('currency.selectCountry')}
      >
        <span className="text-base leading-none">{selectedCountry.flag_emoji}</span>
        <span>{selectedCurrency.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-sm border border-border/15 bg-card shadow-2xl z-[60]"
          >
            {/* Search */}
            <div className="border-b border-border/10 p-3">
              <div className="flex items-center gap-2 rounded-sm bg-background px-3 py-2">
                <Search className="h-3.5 w-3.5 text-secondary-text/70" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('currency.searchCountry')}
                  className="flex-1 bg-transparent text-xs text-heading outline-none placeholder:text-secondary-text/60"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-64 overflow-y-auto">
              {filtered.length === 0 && (
                <p className="py-6 text-center text-xs text-secondary-text/70">{t('currency.noResults')}</p>
              )}
              {filtered.map((country) => {
                const currency = currencies.find((c) => c.code === country.default_currency_code);
                if (!currency) return null;
                const isActive = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => {
                      setCountry(country.code);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50 ${
                      isActive ? 'bg-gold/5' : ''
                    }`}
                  >
                    <span className="text-lg leading-none">{country.flag_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-heading">{country.name}</p>
                      <p className="text-[10px] text-secondary-text/70">{currency.name} · {currency.code}</p>
                    </div>
                    {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0 text-gold" />}
                  </button>
                );
              })}
            </div>

            {/* Currency override */}
            <div className="border-t border-border/10 p-3">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-secondary-text/70">
                {t('currency.changeCurrency')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`rounded-sm border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      c.code === selectedCurrency.code
                        ? 'border-gold bg-gold text-soft-black'
                        : 'border-border/15 text-heading hover:border-gold'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
