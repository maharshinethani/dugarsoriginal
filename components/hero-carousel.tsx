'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

export function HeroCarousel() {
  const { locale, t } = useLocale();
  const prefersReducedMotion = useRef(false);
  const containerRef = useRef<HTMLElement>(null);

  // Scroll effect capture for top section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Top ki vellina & Scroll chestunna continuously scale change avuthundi (1.15 -> 1.05)
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.0]);
  const opacityOverlay = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const heroContent = {
    desktopImage: '/hero1.png',
    mobileImage: '/hero1.png',
    alt: 'Emerald and diamond necklace on midnight blue',
    eyebrowEn: 'Ocean Elegance Collection',
    eyebrowAr: 'مجموعة أناقة المحيط',
    titleEn: 'Timeless Beauty, Crafted to Last',
    titleAr: 'جمال خالد، مصنوع ليدوم',
    subtitleEn: 'Exceptional craftsmanship. Extraordinary jewellery. A legacy designed for generations.',
    subtitleAr: 'حرفية استثنائية. مجوهرات غير عادية. إرث مصمم للأجيال.',
    textPosition: 'right' as const,
    ctaPrimaryLink: '/jewellery',
    ctaSecondaryLink: '/appointment',
  };

  const isRtl = locale === 'ar';

  return (
    <section
      ref={containerRef}
      className="relative h-[85vh] min-h-[560px] sm:h-[95vh] sm:min-h-[650px] max-h-[850px] w-full overflow-hidden bg-neutral-950 select-none flex items-center justify-center sm:justify-end"
      aria-label="High End Luxury Jewelry Collections"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Image with Continuous Scroll-based Dynamic Zoom Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="h-full w-full"
          style={{
            scale: prefersReducedMotion.current ? 1 : imageScale,
            opacity: opacityOverlay,
          }}
        >
          {/* Desktop Image */}
          <img
            src={heroContent.desktopImage}
            alt={heroContent.alt}
            className="hidden h-full w-full object-cover sm:block brightness-[0.85]"
            loading="eager"
          />
          {/* Mobile Image */}
          <img
            src={heroContent.mobileImage}
            alt={heroContent.alt}
            className="h-full w-full object-cover object-center sm:hidden brightness-[0.70]"
            loading="eager"
          />
        </motion.div>

        {/* Dark Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-black/50 sm:via-black/40 sm:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 hidden sm:block" />
        
        {/* Ambient Gold Aura Effect */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent blur-3xl opacity-70" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex w-full h-full items-center justify-center sm:justify-end px-5 sm:px-12 lg:px-20 py-10">
        <motion.div
          initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full max-w-sm sm:max-w-2xl flex-col items-center text-center sm:items-end sm:text-end gap-4 sm:gap-5"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/40 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300 animate-pulse" />
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-amber-200 uppercase">
              {locale === 'ar' ? heroContent.eyebrowAr : heroContent.eyebrowEn}
            </p>
          </div>

          {/* Main Headline */}
          <h1
            className="font-serif font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-amber-200 tracking-tight leading-[1.15] drop-shadow-2xl"
            style={{ fontSize: 'clamp(2.1rem, 7.5vw, 4.2rem)' }}
          >
            {locale === 'ar' ? heroContent.titleAr : heroContent.titleEn}
          </h1>

          {/* Subtitle */}
          <p className="max-w-xs sm:max-w-lg text-xs sm:text-sm leading-relaxed text-neutral-300/90 font-light tracking-wide px-1 sm:px-0">
            {locale === 'ar' ? heroContent.subtitleAr : heroContent.subtitleEn}
          </p>

          {/* CTAs */}
          <div className="mt-2 flex flex-row items-center justify-center sm:justify-end gap-2.5 sm:gap-4 w-full sm:w-auto">
      <Link 
  href={heroContent.ctaPrimaryLink} 
  className="group relative inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 overflow-hidden rounded-full bg-[#D4AF37] px-4 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-[#C5A028] hover:scale-[1.03] active:scale-95 text-center whitespace-nowrap"
>
  <span>{t('hero.explore')}</span>
  <ArrowUpRight className={`h-3.5 w-3.5 transition-transform duration-300 ${isRtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'} group-hover:-translate-y-0.5 shrink-0`} />
</Link>

            <Link 
              href={heroContent.ctaSecondaryLink} 
              className="group inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-amber-300/30 bg-neutral-900/60 px-4 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-amber-100 backdrop-blur-xl transition-all duration-300 hover:border-amber-300 hover:bg-neutral-900/80 hover:text-white hover:scale-[1.03] active:scale-95 text-center whitespace-nowrap"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span>{t('hero.appointment')}</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 sm:flex flex-col items-center gap-1.5"
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.5em] text-amber-200/90">
          Scroll
        </span>
        <div className="relative flex h-6 w-[14px] items-start justify-center rounded-full border border-amber-300/40 bg-neutral-950/40 p-1 backdrop-blur-md">
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-[2px] rounded-full bg-amber-300"
          />
        </div>
      </motion.div>
    </section>
  );
}