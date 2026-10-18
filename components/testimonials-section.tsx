'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocale } from '@/lib/locale-context';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

interface DefaultTestimonial {
  customer_name: string;
  testimonial_text: string;
  testimonial_text_ar: string;
  rating: number;
  product_ref: string;
  product_ref_ar: string;
}

const defaultTestimonials: DefaultTestimonial[] = [
  {
    customer_name: 'Aisha R.',
    testimonial_text: 'The craftsmanship of my diamond ring is extraordinary. DUGARS created a piece that will be in our family for generations. Truly the art of timeless jewellery.',
    testimonial_text_ar: 'حرفية خاتمي الماسي استثنائية. ابتكرت دوغارس قطعة ستبقى في عائلتنا لأجيال. حقاً فن المجوهرات الخالدة.',
    rating: 5,
    product_ref: 'Signature Diamond Ring',
    product_ref_ar: 'خاتم الماسي سيجنتشر',
  },
  {
    customer_name: 'Mohammed A.',
    testimonial_text: 'Exceptional service and exquisite design. The bespoke necklace exceeded every expectation. The attention to detail is unmatched.',
    testimonial_text_ar: 'خدمة استثنائية وتصميم رائع. القلادة المخصصة فاقت كل توقعاتي. الاهتمام بالتفاصيل لا يضاهى.',
    rating: 5,
    product_ref: 'Bespoke Necklace',
    product_ref_ar: 'قلادة مخصصة',
  },
  {
    customer_name: 'Fatima K.',
    testimonial_text: 'My bridal set from DUGARS was the centerpiece of our wedding. The gold work and stone selection were perfection. Thank you for making our day unforgettable.',
    testimonial_text_ar: 'كانت مجموعة العرائس من دوغارس محور حفل زفافنا. العمل الذهبي واختيار الأحجار كان مثالياً. شكراً لجعل يومونا لا يُنسى.',
    rating: 5,
    product_ref: 'Bridal Collection',
    product_ref_ar: 'مجموعة العرائس',
  },
];

export function TestimonialsSection() {
  const { locale, t } = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(6);
        setTestimonials((data as Testimonial[]) || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  const showDefaults = !loading && testimonials.length === 0;

  if (loading) {
    return (
      <section className="bg-muted/30 py-20 lg:py-28">
        <div className="container-luxury">
          <div className="text-center">
            <div className="mx-auto h-px w-12 bg-gold" />
            <h2 className="mt-4 heading-serif text-3xl text-heading sm:text-4xl">
              {t('testimonial.title')}
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const renderCard = (
    key: string,
    name: string,
    text: string,
    rating: number,
    productRef: string | null,
    isSample: boolean,
    index: number
  ) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="border border-border/10 bg-card p-8"
    >
      <Quote className="h-8 w-8 text-gold/30" />
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star
            key={idx}
            className={`h-3.5 w-3.5 ${idx < rating ? 'fill-gold text-gold' : 'text-border/20'}`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-secondary-text/85">
        &ldquo;{text}&rdquo;
      </p>
      <p className="mt-5 font-serif text-sm text-heading">
        &mdash; {name}
      </p>
      {productRef && (
        <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary-text/50">
          {productRef}
        </p>
      )}
     
    </motion.div>
  );

  return (
    <section className="bg-muted/30 py-20 lg:py-28">
      <div className="container-luxury">
        <div className="text-center">
          <div className="mx-auto h-px w-12 bg-gold" />
          <h2 className="mt-4 heading-serif text-3xl text-heading sm:text-4xl">
            {t('testimonial.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-secondary-text/85">
            {t('testimonial.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showDefaults
            ? defaultTestimonials.map((item, i) =>
                renderCard(
                  `default-${i}`,
                  item.customer_name,
                  locale === 'ar' ? item.testimonial_text_ar : item.testimonial_text,
                  item.rating,
                  locale === 'ar' ? item.product_ref_ar : item.product_ref,
                  true,
                  i
                )
              )
            : testimonials.map((item, i) =>
                renderCard(
                  item.id,
                  item.customer_name,
                  item.testimonial_text,
                  item.rating,
                  item.product_ref,
                  false,
                  i
                )
              )}
        </div>
      </div>
    </section>
  );
}
