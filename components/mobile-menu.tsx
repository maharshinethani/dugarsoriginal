'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { LanguageSwitcher } from './language-switcher';
import { CurrencySelector } from './currency-selector';
import { ThemeSwitcher } from './theme-switcher';
import { siteConfig } from '@/lib/site-config';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale, t } = useLocale();
  const pathname = usePathname();
  const navItems = siteConfig.nav;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm"
          />

          {/* Left-Side Half Page Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 z-[100] flex w-[80vw] max-w-xs flex-col overflow-y-auto bg-background/95 rounded-r-2xl shadow-2xl backdrop-blur-md border-r border-border/20"
          >
            {/* Header Bar */}
            
<div className="flex h-16 items-center justify-between border-b border-border/20 px-3">
  <div className="flex items-center gap-0">
    <div className="flex items-center gap-3">
  {/* Close Button */}
 <button
  onClick={onClose}
  aria-label={t('nav.close')}
  className="group flex h-12 w-12 shrink-0 items-center justify-center   text-body transition-all duration-300 hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-95"
>
  <X
    className="h-[19px] w-[19px] transition-transform duration-300 group-hover:rotate-90"
    strokeWidth={2.8}
  />
</button>

  {/* Brand Logo */}
  <Image
    src="/logo.png"
    alt="DUGARS Logo"
    width={36}
    height={36}
    priority
    className="h-9 w-9 shrink-0 object-contain transition-transform duration-300 hover:scale-105"
  />

  {/* Brand Name */}
  <span
    className="font-serif text-[19px] font-bold leading-none tracking-[0.07em] text-heading"
    style={{ fontFamily: "'Bodoni Moda', serif" }}
  >
    DUGARS
  </span>
</div>

  </div>
</div>

            <div className="gold-line mx-5" />

            {/* Navigation Links */}
            <nav className="flex flex-col px-4 py-5 space-y-1">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`block rounded-md py-2.5 px-3 font-serif text-base tracking-wide transition-all duration-200 border-b border-border/10 ${
                        isActive
                          ? 'bg-gold/20 text-gold font-medium border-gold/30 shadow-sm'
                          : 'text-heading hover:text-gold hover:bg-gold/10'
                      }`}
                    >
                      {locale === 'ar' ? item.label.ar : item.label.en}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Action & Selectors Section */}
            <div className="mt-auto px-5 pb-6 pt-4 space-y-4 border-t border-border/20">
              

              <Link
                href="/appointment"
                onClick={onClose}
                className="btn-gold block w-full text-center py-2.5 text-xs tracking-wider uppercase font-medium shadow-md transition-all hover:shadow-gold/20"
              >
                {t('nav.appointment')}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}