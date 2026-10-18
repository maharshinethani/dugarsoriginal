'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import { getWhatsAppUrl, getPrimaryImageUrl } from '@/lib/whatsapp';
import { formatDisplayPrice, getDisplayName, getProductDisplayPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { locale, t } = useLocale();
  const { hasItem, toggleItem } = useWishlist();
  const { addItem } = useCart();
  const { whatsappNumber } = useSettings();
  const { selectedCurrencyCode, rates, currencies } = useCurrency();
  const { showPrices } = usePriceVisibility();
  const [imgLoaded, setImgLoaded] = useState(false);

  const inWishlist = hasItem(product.id);
  const { current, original, isOnSale } = getProductDisplayPrice(product, selectedCurrencyCode, rates, currencies, product.country_prices);
  const name = getDisplayName(product, locale);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: product.id,
      slug: product.slug,
      name,
      price: current,
      thumbnailUrl: product.thumbnail_url,
      addedAt: new Date().toISOString(),
    });
    toast.success(inWishlist ? t('product.removeFromWishlist') : t('product.addToWishlist'));
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      sku: product.sku,
      price: current,
      thumbnailUrl: product.thumbnail_url,
      imageUrl: getPrimaryImageUrl(product.product_images, product.thumbnail_url, origin) || null,
      quantity: 1,
      size: product.sizes?.[0] || undefined,
      colour: product.colours?.[0] || undefined,
    });
    toast.success(`${name} — ${t('product.addToCart')}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const badges: { label: string; show: boolean }[] = [
    { label: t('badge.new'), show: product.is_new_arrival },
    { label: t('badge.bestseller'), show: product.is_bestseller },
    { label: t('badge.signature'), show: product.is_signature },
    { label: t('badge.bridal'), show: product.is_bridal },
    { label: t('badge.limited'), show: product.is_limited },
    { label: t('badge.sale'), show: isOnSale && showPrices },
  ];
  const visibleBadges = badges.filter((b) => b.show).slice(0, 2);

  const images = product.product_images?.sort((a, b) => a.position - b.position) || [];
  const primaryImage = images[0]?.url || product.thumbnail_url || '';
  const secondaryImage = images[1]?.url || primaryImage;

  return (
    <Link href={`/jewellery/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Badges */}
        {visibleBadges.length > 0 && (
          <div className="absolute start-3 top-3 z-10 flex flex-col gap-1.5">
            {visibleBadges.map((badge, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${
                  badge.label === t('badge.sale')
                    ? 'bg-gold text-soft-black'
                    : 'bg-soft-black/90 text-on-dark'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={t('product.addToWishlist')}
          className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all hover:bg-card"
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              inWishlist ? 'fill-gold text-gold' : 'text-secondary-text/60'
            }`}
          />
        </button>

        {/* Image */}
        {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={primaryImage}
          alt={name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:opacity-0`}
        />
        <img
          src={secondaryImage}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />

        {/* Hover/touch actions */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-2 bg-soft-black/90 py-3 transition-transform duration-300 lg:translate-y-full lg:group-hover:translate-y-0">
          <button
            onClick={handleQuickView}
            aria-label={t('product.quickView')}
            className="flex h-9 w-9 items-center justify-center text-on-dark transition-colors hover:text-gold"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleQuickAdd}
            aria-label={t('product.quickAdd')}
            className="flex h-9 w-9 items-center justify-center text-on-dark transition-colors hover:text-gold"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        {/* Out of stock overlay */}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-heading">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 text-center">
        <h3 className="truncate font-serif text-sm font-normal text-heading transition-colors group-hover:text-gold">
          {name}
        </h3>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          {showPrices ? (
            <>
              <span className="text-xs font-medium text-heading">
                {formatDisplayPrice(current, selectedCurrencyCode, currencies)}
              </span>
              {original && original > current && (
                <span className="text-xs text-secondary-text/60 line-through">
                  {formatDisplayPrice(original, selectedCurrencyCode, currencies)}
                </span>
              )}
            </>
          ) : (
            <span className="text-[10px] font-medium uppercase tracking-wider text-secondary-text/70">
              {t('price.onRequest')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
