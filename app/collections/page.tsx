'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';
import { supabase } from '@/lib/supabase';
import type { Collection } from '@/lib/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SectionHeading } from '@/components/section-heading';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const { locale, t } = useLocale();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      setCollections((data as Collection[]) || []);
      setLoading(false);
    }
    fetchCollections();
  }, []);

  return (
    <div className="container-luxury pt-24 lg:pt-28">
      <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.collections') }]} />
      <SectionHeading 
        title={t('nav.collections')} 
        subtitle={locale === 'ar' ? 'مجموعات مصممة لكل مناسبة وذوق' : 'Collections designed for every occasion and taste' } align="left"
      />

      {loading ? (
        /* Row కి 4 స్కెలిటన్ లోడర్లు - మొబైల్‌లో హైట్ తగ్గించబడింది */
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-60 sm:aspect-[3/4] animate-pulse rounded-xl bg-neutral-800/50" />
          ))}
        </div>
      ) : (
        /* Row కి 4 కార్డ్స్ చూపే Grid */
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((col, i) => {
            const title = locale === 'ar' ? col.name_ar || col.name_en : col.name_en;
            const description = locale === 'ar' ? col.description_ar || col.description_en : col.description_en;

            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link 
                  href={`/collections/${col.slug}`} 
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-lg transition-all duration-500 hover:border-gold/40 hover:shadow-2xl"
                >
                  {/* మొబైల్‌లో h-60 (లేదా కావాలంటే h-52) ఇచ్చాము, sm (tablet/desktop) నుండి aspect-[3/4] వర్తిస్తుంది */}
                  <div className="relative h-60 sm:h-auto sm:aspect-[3/4] w-full overflow-hidden">
                    {/* High Quality Next Image */}
                    {col.hero_image_url ? (
                      <Image
                        src={col.hero_image_url}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        quality={90}
                        priority={i < 4}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-800" />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-75" />

                    {/* Text Overlay Details */}
                    <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end">
                      <h3 className="font-serif text-xl font-light text-white drop-shadow-md transition-colors duration-300 group-hover:text-gold-light">
                        {title}
                      </h3>
                      {description && (
                        <p className="mt-1.5 text-xs text-gray-200/90 line-clamp-2 drop-shadow">
                          {description}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold group-hover:text-white transition-colors duration-300">
                        {t('section.discover')}
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}