'use client';

import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import { getWhatsAppUrl, normalizeUrl } from '@/lib/whatsapp';
import { formatDisplayPrice, convertPrice } from '@/lib/format';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Link from 'next/link';
import { Trash2, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { locale, t } = useLocale();
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const { getWhatsappForPurpose, whatsappNumber } = useSettings();
  const { selectedCurrencyCode, rates, currencies } = useCurrency();
  const { showPrices } = usePriceVisibility();
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  }, []);

  const convertedSubtotal = convertPrice(subtotal, selectedCurrencyCode, rates, currencies.find(c => c.code === selectedCurrencyCode)).amount;

  const enquiryUrl = getWhatsAppUrl(
    {
      type: 'cart_enquiry',
      items: items.map((i) => {
        const convertedUnit = convertPrice(i.price, selectedCurrencyCode, rates, currencies.find(c => c.code === selectedCurrencyCode)).amount;
        const convertedLine = convertPrice(i.price * i.quantity, selectedCurrencyCode, rates, currencies.find(c => c.code === selectedCurrencyCode)).amount;
        return {
          productId: i.productId,
          name: i.name,
          sku: i.sku || undefined,
          quantity: i.quantity,
          unitPrice: showPrices ? formatDisplayPrice(convertedUnit, selectedCurrencyCode, currencies) : undefined,
          subtotal: showPrices ? formatDisplayPrice(convertedLine, selectedCurrencyCode, currencies) : undefined,
          currency: showPrices ? selectedCurrencyCode : undefined,
          imageUrl: normalizeUrl(i.imageUrl || i.thumbnailUrl || undefined, origin),
          productUrl: normalizeUrl(`/jewellery/${i.slug}`, origin),
        };
      }),
      totalItems,
      orderSubtotal: showPrices ? formatDisplayPrice(convertedSubtotal, selectedCurrencyCode, currencies) : undefined,
      currency: showPrices ? selectedCurrencyCode : undefined,
      locale,
    },
    getWhatsappForPurpose('order') || whatsappNumber
  );

  if (items.length === 0) {
    return (
      <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <ShoppingBag className="h-12 w-12 text-secondary-text/20" />
        <h1 className="mt-6 heading-serif text-3xl text-heading">{t('cart.empty')}</h1>
        <p className="mt-3 text-sm text-secondary-text/80">{t('cart.emptyDesc')}</p>
        <Link href="/jewellery" className="mt-8 btn-gold">{t('cart.continueShopping')}</Link>
      </div>
    );
  }

  return (
    <div className="container-luxury pt-24 lg:pt-28">
      <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.cart') }]} />

      <h1 className="heading-serif text-3xl text-heading sm:text-4xl">{t('cart.title')}</h1>
      <p className="mt-2 text-sm text-secondary-text/80">{totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')}</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={`${item.productId}-${item.size || ''}-${item.colour || ''}`}
              layout
              className="flex gap-4 border border-border/10 p-4"
            >
              {item.thumbnailUrl && (
                <Link href={`/jewellery/${item.slug}`} className="flex-shrink-0">
                  <img src={item.thumbnailUrl} alt={item.name} className="h-24 w-24 object-cover" />
                </Link>
              )}
              <div className="flex flex-1 flex-col">
                <Link href={`/jewellery/${item.slug}`} className="font-serif text-base text-heading hover:text-gold">
                  {item.name}
                </Link>
                {item.sku && <p className="mt-1 text-xs text-secondary-text/70">{t('product.sku')}: {item.sku}</p>}
                <div className="mt-1 flex gap-3 text-xs text-secondary-text/80">
                  {item.size && <span>{t('product.size')}: {item.size}</span>}
                  {item.colour && <span>{t('product.colour')}: {item.colour}</span>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.colour)} className="flex h-8 w-8 items-center justify-center border border-border/20 text-heading hover:border-gold">−</button>
                    <span className="w-8 text-center text-sm text-heading">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.colour)} className="flex h-8 w-8 items-center justify-center border border-border/20 text-heading hover:border-gold">+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    {showPrices && <span className="text-sm font-medium text-heading">{formatDisplayPrice(convertPrice(item.price * item.quantity, selectedCurrencyCode, rates, currencies.find(c => c.code === selectedCurrencyCode)).amount, selectedCurrencyCode, currencies)}</span>}
                    <button onClick={() => removeItem(item.productId, item.size, item.colour)} aria-label={t('cart.removeItem')} className="text-secondary-text/70 transition-colors hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border/10 p-6">
            <h2 className="label-luxury text-heading">{t('cart.total')}</h2>
            <div className="mt-4 space-y-3">
              {showPrices && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-text/80">{t('cart.subtotal')}</span>
                    <span className="font-medium text-heading">{formatDisplayPrice(convertedSubtotal, selectedCurrencyCode, currencies)}</span>
                  </div>
                  <div className="border-t border-border/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-heading">{t('cart.total')}</span>
                      <span className="text-lg font-light text-heading">{formatDisplayPrice(convertedSubtotal, selectedCurrencyCode, currencies)}</span>
                    </div>
                  </div>
                </>
              )}
              {!showPrices && (
                <p className="text-xs text-secondary-text/70">{locale === 'ar' ? 'الأسعار غير معروضة. سيتم طلب السعر عبر واتساب.' : 'Prices are not displayed. Pricing will be requested via WhatsApp.'}</p>
              )}
            </div>
            <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="mt-6 btn-gold w-full">
              <MessageCircle className="h-4 w-4" />
              {t('cart.enquireWhatsapp')}
            </a>
            <Link href="/jewellery" className="mt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-secondary-text/80 transition-colors hover:text-gold">
              <ArrowRight className="h-3 w-3 rotate-180 rtl:rotate-0" />
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
