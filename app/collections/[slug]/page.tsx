'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { supabase } from '@/lib/supabase';
import type { Collection, Product } from '@/lib/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductCard } from '@/components/product-card';
import { QuickView } from '@/components/quick-view';
import Link from 'next/link';

export default function CollectionDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: col } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (col) {
        setCollection(col as Collection);

        // First try: products assigned via collection_products join table
        const { data: cpRows } = await supabase
          .from('collection_products')
          .select('product_id, position')
          .eq('collection_id', col.id)
          .order('position', { ascending: true });

        if (cpRows && cpRows.length > 0) {
          const ids = cpRows.map((r) => r.product_id);
          const { data: prods } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('status', 'published')
            .in('id', ids);

          // Preserve join-table ordering
          const sorted = (prods || []).sort((a, b) => {
            const posA = cpRows.find((r) => r.product_id === a.id)?.position ?? 999;
            const posB = cpRows.find((r) => r.product_id === b.id)?.position ?? 999;
            return posA - posB;
          });
          setProducts(sorted as Product[]);
        } else {
          // Fallback: products that have collection_id FK pointing here
          const { data: prods } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('status', 'published')
            .eq('collection_id', col.id)
            .order('created_at', { ascending: false });
          setProducts((prods as Product[]) || []);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-luxury pt-24">
        <div className="h-[400px] animate-pulse bg-muted" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container-luxury flex min-h-[60vh] flex-col items-center justify-center pt-24 text-center">
        <h1 className="heading-serif text-3xl text-heading">Collection not found</h1>
        <Link href="/collections" className="mt-6 btn-gold">{t('nav.collections')}</Link>
      </div>
    );
  }

  const name = locale === 'ar' ? collection.name_ar || collection.name_en : collection.name_en;
  const description = locale === 'ar' ? collection.description_ar || collection.description_en : collection.description_en;
  const story = locale === 'ar' ? (collection as any).story_ar || (collection as any).story_en : (collection as any).story_en;
  const heroImage = collection.hero_image_url || '';

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="relative h-[400px] overflow-hidden sm:h-[500px]">
        {heroImage ? (
          <img src={heroImage} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-soft-black/50" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <div>
            <h1 className="heading-serif text-4xl text-on-dark sm:text-5xl lg:text-6xl">{name}</h1>
            {description && (
              <p className="mx-auto mt-4 max-w-lg text-sm text-on-dark/80">{description}</p>
            )}
          </div>
        </div>
      </section>

      <div className="container-luxury">
        <Breadcrumbs
          items={[
            { label: t('nav.home'), href: '/' },
            { label: t('nav.collections'), href: '/collections' },
            { label: name },
          ]}
        />
      </div>

      {/* Story */}
      {story && (
        <section className="container-luxury py-16 text-center">
          <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-secondary-text/70">{story}</p>
        </section>
      )}

      {/* Products */}
      <section className="container-luxury pb-20">
        <h2 className="heading-serif text-2xl text-heading">{t('nav.jewellery')}</h2>
        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto h-px w-12 bg-gold/40" />
            <p className="mt-6 text-sm text-secondary-text/70">
              {locale === 'ar' ? 'لا توجد منتجات في هذه المجموعة حتى الآن.' : 'No products in this collection yet.'}
            </p>
            <Link href="/jewellery" className="mt-6 btn-outline-gold text-xs">
              {locale === 'ar' ? 'تصفح جميع المجوهرات' : 'Browse all jewellery'}
            </Link>
          </div>
        )}
      </section>

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
