'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/lib/locale-context';
import Link from 'next/link';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  align?: 'left' | 'center';
  locale?: 'en' | 'ar';
}

export function SectionHeading({ title, subtitle, viewAllLink, align = 'center' }: SectionHeadingProps) {
  const { t } = useLocale();
  const isCenter = align === 'center';

  return (
    <div className={`flex flex-col gap-4 ${isCenter ? 'items-center text-center' : 'items-start text-start'} ${viewAllLink ? 'sm:flex-row sm:items-end sm:justify-between sm:text-start' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className={isCenter && !viewAllLink ? 'flex flex-col items-center' : ''}
      >
        <div className={`h-px w-12 bg-gold ${isCenter ? 'mb-4' : 'mb-4'}`} />
        <h2 className="heading-serif text-3xl text-heading sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-3 max-w-xl text-sm leading-relaxed text-secondary-text/85 ${isCenter ? 'mx-auto' : ''}`}>            {subtitle}
          </p>
        )}
      </motion.div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="group flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-heading transition-colors hover:text-gold"
        >
          {t('section.viewAll')}
          <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">→</span>
        </Link>
      )}
    </div>
  );
}
