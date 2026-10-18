'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { supabase } from '@/lib/supabase';
import type { Product, Category, Collection } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { QuickView } from '@/components/quick-view';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SectionHeading } from '@/components/section-heading';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sortOptions = [
  { key: 'featured', labelKey: 'filter.sortFeatured' },
  { key: 'newest', labelKey: 'filter.sortNewest' },
  { key: 'price_low', labelKey: 'filter.sortPriceLow' },
  { key: 'price_high', labelKey: 'filter.sortPriceHigh' },
  { key: 'name', labelKey: 'filter.sortName' },
];

const metals = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum'];
const stones = ['Diamond', 'Sapphire', 'Emerald', 'Pearl', 'Ruby'];

// Custom fallback or direct image for the "All" category button
const ALL_CATEGORY_IMAGE = "/all.jfif";

export default function JewelleryPage() {
  const { locale, t } = useLocale();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    collection: '',
    metal: '',
    stone: '',
    priceMin: '',
    priceMax: '',
    featured: searchParams.get('filter') === 'featured',
    bestseller: searchParams.get('filter') === 'bestseller',
    newArrival: searchParams.get('filter') === 'new',
    sort: 'featured',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [prods, cats, cols] = await Promise.all([
          supabase.from('products').select('*, product_images(*)').eq('status', 'published').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('collections').select('*').eq('is_published', true).order('display_order', { ascending: true }),
        ]);
        setProducts((prods.data as Product[]) || []);
        setCategories((cats.data as Category[]) || []);
        setCollections((cols.data as Collection[]) || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (filters.category) result = result.filter((p) => p.category === filters.category);
    if (filters.collection) result = result.filter((p) => p.collection_id === filters.collection);
    if (filters.metal) result = result.filter((p) => p.metal === filters.metal);
    if (filters.stone) result = result.filter((p) => p.stone === filters.stone);
    if (filters.priceMin) result = result.filter((p) => (p.sale_price || p.price) >= parseFloat(filters.priceMin));
    if (filters.priceMax) result = result.filter((p) => (p.sale_price || p.price) <= parseFloat(filters.priceMax));
    if (filters.featured) result = result.filter((p) => p.is_featured);
    if (filters.bestseller) result = result.filter((p) => p.is_bestseller);
    if (filters.newArrival) result = result.filter((p) => p.is_new_arrival);

    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price_low':
        result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price_high':
        result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name_en.localeCompare(b.name_en));
        break;
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, filters]);

  const clearFilters = () => {
    setFilters({ category: '', collection: '', metal: '', stone: '', priceMin: '', priceMax: '', featured: false, bestseller: false, newArrival: false, sort: 'featured' });
  };

  const activeFilterCount = [filters.category, filters.collection, filters.metal, filters.stone, filters.priceMin, filters.priceMax].filter(Boolean).length + (filters.featured ? 1 : 0) + (filters.bestseller ? 1 : 0) + (filters.newArrival ? 1 : 0);

  return (
    <div className="container-luxury pt-24 lg:pt-28">
      <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.jewellery') }]} />

      <SectionHeading title={t('nav.jewellery')} subtitle={locale === 'ar' ? 'اكتشف مجموعتنا الكاملة من المجوهرات الفاخرة' : 'Discover our complete collection of luxury jewellery'} align="left" />

      {/* Category Navigation */}
      {!loading && categories.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 justify-items-center">
            
            {/* All Category Button */}
            <button
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 ${filters.category === '' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <div className={`h-14 w-14 overflow-hidden rounded-full border-2 transition-all shadow-sm sm:h-20 sm:w-20 ${filters.category === '' ? 'border-gold ring-2 ring-gold/20' : 'border-border/20 hover:border-gold/50'}`}>
                <img src={ALL_CATEGORY_IMAGE} alt="All Jewellery" loading="lazy" className="h-full w-full object-cover object-center" />
              </div>
              <span className={`text-[10px] font-medium uppercase tracking-wider text-center ${filters.category === '' ? 'text-gold font-bold' : 'text-secondary-text/80'}`}>
                {locale === 'ar' ? 'الكل' : 'All'}
              </span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const isActive = filters.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilters({ ...filters, category: cat.slug })}
                  className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className={`h-14 w-14 overflow-hidden rounded-full border-2 transition-all shadow-sm sm:h-20 sm:w-20 ${isActive ? 'border-gold ring-2 ring-gold/20' : 'border-border/20 hover:border-gold/50'}`}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en} loading="lazy" className="h-full w-full object-cover object-center" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="font-serif text-xs text-secondary-text/70">{(locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en).charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium uppercase tracking-wider text-center truncate w-full ${isActive ? 'text-gold font-bold' : 'text-secondary-text/80'}`}>
                    {locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-8 flex items-center justify-between border-b border-border/10 pb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-heading transition-colors hover:text-gold"
        >
          <Filter className="h-4 w-4" />
          {t('filter.title')}
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] text-soft-black">{activeFilterCount}</span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-secondary-text/80">{filtered.length} {t('filter.results')}</span>
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="appearance-none border border-border/20 bg-card py-2 ps-3 pe-8 text-xs text-heading outline-none focus:border-gold"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{t(opt.labelKey as any)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3 w-3 -translate-y-1/2 text-secondary-text/70" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 pt-8 lg:flex-row lg:gap-8">
        {/* Filters sidebar — drawer on mobile, aside on desktop */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Mobile backdrop */}
              <div
                className="fixed inset-0 z-40 bg-soft-black/60 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 end-0 z-50 w-[85vw] max-w-sm overflow-y-auto bg-background p-6 lg:static lg:inset-auto lg:z-auto lg:w-64 lg:max-w-none lg:transform-none lg:bg-transparent lg:p-0"
              >
              <div className="w-full space-y-6 lg:w-64">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-heading">{t('filter.title')}</h3>
                  <div className="flex items-center gap-3">
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-[10px] uppercase tracking-wider text-gold hover:underline">
                        {t('filter.clearAll')}
                      </button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="text-secondary-text/70 hover:text-gold lg:hidden">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <FilterGroup label={t('filter.category')}>
                  <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full border border-border/20 bg-card px-3 py-2.5 text-xs text-heading outline-none focus:border-gold">
                    <option value="">{t('common.all')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>{locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en}</option>
                    ))}
                  </select>
                </FilterGroup>

                <FilterGroup label={t('filter.collection')}>
                  <select value={filters.collection} onChange={(e) => setFilters({ ...filters, collection: e.target.value })} className="w-full border border-border/20 bg-card px-3 py-2.5 text-xs text-heading outline-none focus:border-gold">
                    <option value="">{t('common.all')}</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>{locale === 'ar' ? col.name_ar || col.name_en : col.name_en}</option>
                    ))}
                  </select>
                </FilterGroup>

                <FilterGroup label={t('filter.metal')}>
                  <div className="space-y-2">
                    {metals.map((m) => (
                      <label key={m} className="flex items-center gap-2 text-xs text-secondary-text/85">
                        <input type="radio" name="metal" checked={filters.metal === m} onChange={() => setFilters({ ...filters, metal: m })} className="accent-gold" />
                        {m}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup label={t('filter.stone')}>
                  <div className="space-y-2">
                    {stones.map((s) => (
                      <label key={s} className="flex items-center gap-2 text-xs text-secondary-text/85">
                        <input type="radio" name="stone" checked={filters.stone === s} onChange={() => setFilters({ ...filters, stone: s })} className="accent-gold" />
                        {s}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup label={t('filter.price')}>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder={t('filter.from')} value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} className="w-full min-w-0 border border-border/20 bg-card px-2 py-1.5 text-xs text-heading outline-none focus:border-gold" />
                    <span className="text-secondary-text/60">—</span>
                    <input type="number" placeholder={t('filter.to')} value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} className="w-full min-w-0 border border-border/20 bg-card px-2 py-1.5 text-xs text-heading outline-none focus:border-gold" />
                  </div>
                </FilterGroup>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-secondary-text/85">
                    <input type="checkbox" checked={filters.featured} onChange={(e) => setFilters({ ...filters, featured: e.target.checked })} className="accent-gold" />
                    {t('filter.featured')}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-secondary-text/85">
                    <input type="checkbox" checked={filters.bestseller} onChange={(e) => setFilters({ ...filters, bestseller: e.target.checked })} className="accent-gold" />
                    {t('filter.bestseller')}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-secondary-text/85">
                    <input type="checkbox" checked={filters.newArrival} onChange={(e) => setFilters({ ...filters, newArrival: e.target.checked })} className="accent-gold" />
                    {t('filter.newArrival')}
                  </label>
                </div>
              </div>
            </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-secondary-text/80">{t('filter.noResults')}</p>
              <button onClick={clearFilters} className="mt-4 text-xs uppercase tracking-wider text-gold hover:underline">
                {t('filter.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-luxury mb-3 text-secondary-text/80">{label}</p>
      {children}
    </div>
  );
}