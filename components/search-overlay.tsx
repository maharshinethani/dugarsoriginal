'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { useCurrency } from '@/lib/currency-context';
import { supabase } from '@/lib/supabase';
import { formatDisplayPrice, getProductDisplayPrice } from '@/lib/format';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import type { Product } from '@/lib/types';
import Link from 'next/link';

const popularSearches = {
  en: ['Diamond Rings', 'Gold Necklaces', 'Bridal', 'Earrings', 'Bestsellers'],
  ar: ['خواتم ألماس', 'قلائد ذهب', 'للعرائس', 'أقراط', 'الأكثر مبيعاً'],
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useLocale();
  const { selectedCurrencyCode, rates, currencies } = useCurrency();
  const { showPrices } = usePriceVisibility();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%,sku.ilike.%${query}%`)
          .limit(8);
        setResults((data as Product[]) || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-soft-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-h-[100vh] max-w-3xl overflow-y-auto bg-card px-4 py-6 shadow-2xl sm:mt-20 sm:max-h-[80vh] sm:rounded-sm sm:px-6 sm:py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-light tracking-[0.2em] text-heading">
                {t('search.title')}
              </h2>
              <button onClick={onClose} aria-label={t('nav.close')} className="flex h-9 w-9 items-center justify-center">
                <X className="h-5 w-5 text-secondary-text/80 hover:text-gold" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 border-b border-border/20 pb-3">
              <Search className="h-5 w-5 text-secondary-text/70" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent text-base text-heading outline-none placeholder:text-secondary-text/60 sm:text-sm"
                autoFocus
              />
            </div>

            {/* Results */}
            {query.trim().length >= 2 && (
              <div className="mt-6 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <p className="py-8 text-center text-sm text-secondary-text/80">
                    {t('common.loading')}
                  </p>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/jewellery/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 transition-colors hover:bg-muted"
                      >
                        {product.thumbnail_url && (
                          <img
                            src={product.thumbnail_url}
                            alt=""
                            className="h-14 w-14 object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-heading">
                            {locale === 'ar' ? product.name_ar || product.name_en : product.name_en}
                          </p>
                          <p className="text-xs text-gold">
                            {showPrices ? formatDisplayPrice(getProductDisplayPrice(product, selectedCurrencyCode, rates, currencies).current, selectedCurrencyCode, currencies) : t('price.onRequest')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium text-heading">
                      {t('search.noResults')}
                    </p>
                    <p className="mt-1 text-xs text-secondary-text/80">
                      {t('search.noResultsDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Popular searches */}
            {query.trim().length < 2 && (
              <div className="mt-6">
                <p className="label-luxury text-secondary-text/80">
                  {t('search.popular')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularSearches[locale].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="border border-border/20 px-3 py-2 text-xs text-secondary-text/85 transition-colors hover:border-gold hover:text-gold"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
