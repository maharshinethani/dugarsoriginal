'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/lib/locale-context';
import { SectionHeading } from '@/components/section-heading';
import { ProductCard } from '@/components/product-card';
import { QuickView } from '@/components/quick-view';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, Category, Collection } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, Calendar, Sparkles, Shield, Globe, Gem, Award, Heart } from 'lucide-react';
import { HeroCarousel } from '@/components/hero-carousel';
import { TestimonialsSection } from '@/components/testimonials-section';

export default function HomePage() {
  const { locale, t } = useLocale();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [feat, best, newArr, cats, cols] = await Promise.all([
          supabase.from('products').select('*, product_images(*)').eq('status', 'published').eq('is_featured', true).limit(8),
          supabase.from('products').select('*, product_images(*)').eq('status', 'published').eq('is_bestseller', true).limit(4),
          supabase.from('products').select('*, product_images(*)').eq('status', 'published').eq('is_new_arrival', true).order('created_at', { ascending: false }).limit(8),
          supabase.from('categories').select('*').eq('is_published', true).order('display_order', { ascending: true }),
          supabase.from('collections').select('*').eq('is_published', true).order('display_order', { ascending: true }),
        ]);

        setFeaturedProducts((feat.data as Product[]) || []);
        setBestsellers((best.data as Product[]) || []);
        setCategories((cats.data as Category[]) || []);
        setCollections((cols.data as Collection[]) || []);

        let newProducts = (newArr.data as Product[]) || [];
        if (newProducts.length === 0) {
          const { data: latestData } = await supabase
            .from('products')
            .select('*, product_images(*)')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(8);
          newProducts = (latestData as Product[]) || [];
        }
        setNewArrivals(newProducts);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const trustItems = [
    { icon: Shield, label: t('trust.secureShopping') },
    { icon: Globe, label: t('trust.worldwide') },
    { icon: Gem, label: t('trust.authentic') },
    { icon: Award, label: t('trust.expertCraft') },
  ];

  return (
    <>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* TRUST BAR */}
      <section className="border-b border-border/10 bg-card">
        <div className="container-luxury py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2 text-center">
                <item.icon className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-secondary-text/90 sm:text-[11px] sm:tracking-[0.15em]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND INTRO */}
     

      {/* SHOP BY CATEGORY */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container-luxury">
          <SectionHeading
            title={t('section.shopByCategory')}
            subtitle={t('section.shopByCategoryDesc')}
            viewAllLink="/jewellery"
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
            {categories.slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link href={`/jewellery?category=${cat.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted shadow-sm transition-all duration-300 group-hover:shadow-md">
                    <img
                      src={cat.image_url || ''}
                      alt={locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-soft-black/60 via-soft-black/20 to-transparent transition-opacity group-hover:opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                      <span className="font-serif text-sm font-medium tracking-wide text-on-dark transition-transform duration-300 group-hover:scale-105 sm:text-base">
                        {locale === 'ar' ? cat.name_ar || cat.name_en : cat.name_en}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
  <section className="container-luxury py-16 lg:py-24">
  <SectionHeading
    title={t('section.featuredCollections')}
    viewAllLink="/collections"
  />
  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {collections.slice(0, 6).map((col, i) => {
      const isLargeCard = i < 2;
      return (
        <motion.div
          key={col.id}
          className={isLargeCard ? 'col-span-1 sm:col-span-1 lg:col-span-2' : 'col-span-1'}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <Link
            href={`/collections/${col.slug}`}
            className="group relative block overflow-hidden rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500"
          >
            {/* Mobile lo h-56 valla anni images EXACT SAME HEIGHT lo untayi */}
            <div className={`relative overflow-hidden h-56 sm:h-auto ${isLargeCard ? 'sm:aspect-[2.3/1]' : 'sm:aspect-[4/3]'}`}>
              <img
                src={col.hero_image_url || ''}
                alt={locale === 'ar' ? col.name_ar || col.name_en : col.name_en}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 text-white">
                <h3 className="font-serif text-lg sm:text-2xl font-normal tracking-wide text-white drop-shadow-sm">
                  {locale === 'ar' ? col.name_ar || col.name_en : col.name_en}
                </h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-light uppercase tracking-widest text-white/90 group-hover:underline">
                  {t('section.discover')} &gt;
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      );
    })}
  </div>
</section>

      {/* BESTSELLERS */}
  

      {/* EDITORIAL */}
     

      {/* NEW ARRIVALS */}
       {newArrivals.length > 0 && (
        <section className="container-luxury py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[4/5] min-h-[400px] lg:min-h-[480px]">
              <img
                src="/NewArrivals.jfif" 
                alt={t('section.newArrivals')}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-8 flex flex-col min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-serif font-semibold text-gray-900">
                    {t('section.latestIntroductions')}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 mt-1">
                    {t('section.latestIntroductionsSub')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link 
                    href="/jewellery?filter=new" 
                    className="text-sm font-medium text-amber-800 hover:underline hidden sm:block mr-2"
                  >
                    {t('common.viewAll')}
                  </Link>

                  <button
                    onClick={() => {
                      const container = document.getElementById('new-arrivals-scroll');
                      if (container) {
                        const card = container.firstElementChild as HTMLElement;
                        const cardWidth = card ? card.offsetWidth + 16 : 300;
                        container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-700 transition-colors"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById('new-arrivals-scroll');
                      if (container) {
                        const card = container.firstElementChild as HTMLElement;
                        const cardWidth = card ? card.offsetWidth + 16 : 300;
                        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-700 transition-colors"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div 
                id="new-arrivals-scroll"
                className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                {newArrivals.map((product) => (
                  <div 
                    key={product.id} 
                    className="w-[calc(100%-12px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-11px)] flex-shrink-0 snap-start"
                  >
                    <ProductCard 
                      product={product} 
                      onQuickView={setQuickViewProduct} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BESPOKE */}
   

      {/* WHY DUGARS */}
    

      {/* CRAFTSMANSHIP */}
   

      {/* APPOINTMENT */}
      <section className="container-luxury py-20 lg:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img
              src="https://images.pexels.com/photos/33257665/pexels-photo-33257665.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Private Appointment"
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: locale === 'ar' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-px w-12 bg-gold" />
            <h2 className="mt-4 heading-serif text-3xl text-heading sm:text-4xl lg:text-5xl">
              {t('section.appointment')}
            </h2>
            <p className="mt-4 text-sm text-secondary-text/85">
              {t('appointment.subtitle')}
            </p>
            <div className="mt-8 space-y-4">
              {[
                t('appointment.inStore'),
                t('appointment.virtual'),
                t('appointment.whatsapp'),
              ].map((type, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border/10 pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40">
                    <span className="text-xs font-medium text-gold">{i + 1}</span>
                  </div>
                  <span className="text-sm text-heading">{type}</span>
                </div>
              ))}
            </div>
            <Link href="/appointment" className="mt-8 btn-gold">
              <Calendar className="h-4 w-4" />
              {t('nav.appointment')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL / INSTAGRAM */}
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="container-luxury">
          <SectionHeading title={t('section.social')} />
          <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {[
              'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
              'https://images.pexels.com/photos/4889719/pexels-photo-4889719.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
              'https://images.pexels.com/photos/2849743/pexels-photo-2849743.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
              'https://images.pexels.com/photos/34399059/pexels-photo-34399059.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
              'https://images.pexels.com/photos/10215179/pexels-photo-10215179.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
              'https://images.pexels.com/photos/12427696/pexels-photo-12427696.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative aspect-square overflow-hidden"
              >
                <img src={img} alt="Instagram" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-soft-black/0 transition-colors group-hover:bg-soft-black/30" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* FINAL CTA */}
    

      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
