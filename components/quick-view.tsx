'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import { getWhatsAppUrl, getPrimaryImageUrl, normalizeUrl } from '@/lib/whatsapp';
import { formatDisplayPrice, getDisplayName, getProductDisplayPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface QuickViewProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickView({ product, onClose }: QuickViewProps) {
  const { locale, t } = useLocale();
  const { addItem } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const { getWhatsappForPurpose, whatsappNumber } = useSettings();
  const { selectedCurrencyCode, rates, currencies } = useCurrency();
  const { showPrices } = usePriceVisibility();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  }, []);

  if (!product) return null;

  const name = getDisplayName(product, locale);
  const { current, original, isOnSale, displayCurrency } = getProductDisplayPrice(product, selectedCurrencyCode, rates, currencies, product.country_prices);
  const inWishlist = hasItem(product.id);

  const images = product.product_images?.sort((a, b) => a.position - b.position) || [];
  const primaryImage = images[0]?.url || product.thumbnail_url || '';

  const primaryImageUrl = getPrimaryImageUrl(product.product_images, product.thumbnail_url, origin);
  const productUrl = normalizeUrl(`/jewellery/${product.slug}`, origin);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      sku: product.sku,
      price: current,
      thumbnailUrl: product.thumbnail_url,
      imageUrl: primaryImageUrl || null,
      quantity: 1,
      size: selectedSize || product.sizes?.[0] || undefined,
      colour: selectedColour || product.colours?.[0] || undefined,
    });
    toast.success(`${name} — ${t('product.addToCart')}`);
    onClose();
  };

  const handleWishlist = () => {
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

  const buyNowUrl = getWhatsAppUrl(
    {
      type: 'buy_now',
      productId: product.id,
      productName: name,
      sku: product.sku || undefined,
      quantity: 1,
      price: showPrices ? formatDisplayPrice(current, displayCurrency, currencies) : undefined,
      currency: showPrices ? displayCurrency : undefined,
      subtotal: showPrices ? formatDisplayPrice(current, displayCurrency, currencies) : undefined,
      imageUrl: primaryImageUrl,
      productUrl,
      locale,
    },
    getWhatsappForPurpose('buy_now') || whatsappNumber
  );

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-soft-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-hidden bg-card shadow-2xl sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t('common.close')}
              className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 transition-colors hover:bg-card"
            >
              <X className="h-4 w-4 text-heading" />
            </button>

            {/* Image */}
            <div className="aspect-square sm:aspect-auto">
              <img src={primaryImage} alt={name} className="h-full w-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex flex-col p-6">
              <h2 className="font-serif text-xl font-light text-heading">{name}</h2>
              <div className="mt-2 flex items-center gap-2">
                {showPrices ? (
                  <>
                    <span className="text-lg font-medium text-heading">
                      {formatDisplayPrice(current, displayCurrency, currencies)}
                    </span>
                    {original && original > current && (
                      <span className="text-sm text-secondary-text/70 line-through">
                        {formatDisplayPrice(original, displayCurrency, currencies)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary-text/70">
                    {t('price.onRequest')}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-secondary-text/70">
                {locale === 'ar'
                  ? product.short_description_ar || product.short_description_en
                  : product.short_description_en}
              </p>

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div className="mt-4">
                  <p className="label-luxury text-secondary-text/70">{t('product.selectSize')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 border px-3 py-1.5 text-xs transition-colors ${
                          selectedSize === size
                            ? 'border-gold bg-gold text-soft-black'
                            : 'border-border/20 text-heading hover:border-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colours */}
              {product.colours?.length > 0 && (
                <div className="mt-4">
                  <p className="label-luxury text-secondary-text/70">{t('product.selectColour')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colours?.map((colour) => (
                      <button
                        key={colour}
                        onClick={() => setSelectedColour(colour)}
                        className={`border px-3 py-1.5 text-xs transition-colors ${
                          selectedColour === colour
                            ? 'border-gold bg-gold text-soft-black'
                            : 'border-border/20 text-heading hover:border-gold'
                        }`}
                      >
                        {colour}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto space-y-2 pt-6">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="btn-emerald flex-1"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {t('product.addToCart')}
                  </button>
                  <button
                    onClick={handleWishlist}
                    aria-label={t('product.addToWishlist')}
                    className="flex h-11 w-11 items-center justify-center border border-border/20 transition-colors hover:border-gold"
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'fill-gold text-gold' : 'text-heading'}`} />
                  </button>
                </div>
                <a href={buyNowUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold w-full">
                  {t('product.buyNow')}
                </a>
                <Link
                  href={`/jewellery/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 pt-2 text-xs font-medium uppercase tracking-wider text-secondary-text/70 transition-colors hover:text-gold"
                >
                  {t('product.viewDetails')}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
