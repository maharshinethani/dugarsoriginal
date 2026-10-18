'use client';

import { useLocale } from '@/lib/locale-context';
import { TestimonialsSection } from '@/components/testimonials-section';
import { TestimonialForm } from '@/components/testimonial-form';
import { Breadcrumbs } from '@/components/breadcrumbs';

export default function TestimonialsPage() {
  const { locale, t } = useLocale();

  return (
    <div className="container-luxury pt-24 lg:pt-28 pb-20">
      <Breadcrumbs items={[
        { label: t('nav.home'), href: '/' },
        { label: t('testimonial.title') },
      ]} />

      <div className="text-center">
        <div className="mx-auto h-px w-12 bg-gold" />
        <h1 className="mt-4 heading-serif text-3xl text-heading sm:text-4xl">
          {t('testimonial.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-secondary-text/85">
          {t('testimonial.subtitle')}
        </p>
      </div>

      <div className="mt-12">
        <TestimonialsSection />
      </div>

      <div className="mt-16 border-t border-border/10 pt-12">
        <h2 className="heading-serif text-2xl text-heading sm:text-3xl">
          {t('testimonial.write')}
        </h2>
        <p className="mt-2 text-sm text-secondary-text/70">
          {locale === 'ar'
            ? 'شارك تجربتك مع دوغارس. سيتم مراجعة رأيك قبل نشره.'
            : 'Share your experience with DUGARS. Your testimonial will be reviewed before publishing.'}
        </p>
        <TestimonialForm />
      </div>
    </div>
  );
}
