'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { siteConfig } from '@/lib/site-config';
import { LanguageSwitcher } from './language-switcher';
import { SearchOverlay } from './search-overlay';
import { MobileMenu } from './mobile-menu';
import { Search, Heart, ShoppingBag, Menu, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { locale, t } = useLocale();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  const navItems = siteConfig.nav;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-[30px] z-50 bg-card/95 shadow-sm backdrop-blur-md transition-all duration-500"
      >
        <div className="container-luxury">
          <div className="flex h-12 items-center justify-between lg:h-14">
            {/* Left: Logo & Mobile Menu Trigger */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={t('nav.menu')}
              >
                <Menu className="h-5 w-5 text-gray-900" />
              </button>
              
              <Link href="/" className="group flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Logo Icon"
                  width={36}
                  height={36}
                  className="h-8 w-auto object-contain lg:h-10"
                  priority
                />
                
                <span
                  className="text-xl font-bold tracking-[0.05em] text-gray-900 transition-colors sm:text-2xl"
                  style={{ fontFamily: "'Bodoni Moda', serif" }}
                >
                  DUGARS
                </span>
              </Link>
            </div>

            {/* Center: Nav links (desktop) */}
            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative whitespace-nowrap py-1 text-[14px] font-medium leading-none tracking-[0.02em] transition-colors duration-300 ${
                    isActive(item.href)
                      ? 'text-gold'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${locale === 'ar' ? 'font-arabic' : ''}`}
                >
                  {locale === 'ar' ? item.label.ar : item.label.en}

                  {isActive(item.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 h-[1px] w-full bg-gold"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right: Actions (Search, Language Switcher, Wishlist, Cart, Appointment) */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label={t('nav.search')}
                className="text-gray-900 transition-colors hover:text-gold"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              {/* Language Switcher enabled for both Mobile and Desktop */}
              <div className="flex items-center">
                <LanguageSwitcher />
              </div>

              <Link
                href="/wishlist"
                aria-label={t('nav.wishlist')}
                className="relative text-gray-900 transition-colors hover:text-gold"
              >
                <Heart className="h-[18px] w-[18px]" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-soft-black">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                aria-label={t('nav.cart')}
                className="relative text-gray-900 transition-colors hover:text-gold"
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-soft-black">
                    {totalItems}
                  </span>
                )}
              </Link>

              <Link
                href="/appointment"
                className="hidden items-center gap-2 border border-gold/40 px-4 py-2 text-[9px] font-medium uppercase tracking-[0.15em] text-gold transition-all hover:bg-gold hover:text-soft-black lg:flex sm:px-5 sm:text-[10px] sm:tracking-[0.2em] xl:flex"
              >
                <Calendar className="h-3.5 w-3.5" />
                {t('nav.appointment')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}