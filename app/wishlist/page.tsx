'use client';

import { useLocale } from '@/lib/locale-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import { getWhatsAppUrl, normalizeUrl } from '@/lib/whatsapp';
import { formatDisplayPrice, convertPrice } from '@/lib/format';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const { locale, t } = useLocale();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const { whatsappNumber } = useSettings();
  const { selectedCurrencyCode, rates, currencies } = useCurrency();
  const currencyInfo = currencies.find((c) => c.code === selectedCurrencyCode);
  const { showPrices } = usePriceVisibility();
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  }, []);

  const enquiryUrl = getWhatsAppUrl(
    { type: 'cart_enquiry', items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: 1, unitPrice: showPrices ? formatDisplayPrice(convertPrice(i.price, selectedCurrencyCode, rates, currencyInfo).amount, selectedCurrencyCode, currencies) : undefined, subtotal: showPrices ? formatDisplayPrice(convertPrice(i.price, selectedCurrencyCode, rates, currencyInfo).amount, selectedCurrencyCode, currencies) : undefined, currency: showPrices ? selectedCurrencyCode : undefined, imageUrl: normalizeUrl(i.thumbnailUrl || undefined, origin), productUrl: normalizeUrl(`/jewellery/${i.slug}`, origin) })), totalItems: items.length, orderSubtotal: showPrices ? formatDisplayPrice(items.reduce((sum, i) => sum + convertPrice(i.price, selectedCurrencyCode, rates, currencyInfo).amount, 0), selectedCurrencyCode, currencies) : undefined, currency: showPrices ? selectedCurrencyCode : undefined, locale },
    whatsappNumber
  );

  if (items.length === 0) {
    return (
      <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
        <Heart className="h-12 w-12 text-secondary-text/20" />
        <h1 className="mt-6 heading-serif text-3xl text-heading">{t('wishlist.empty')}</h1>
        <p className="mt-3 text-sm text-secondary-text/70">{t('wishlist.emptyDesc')}</p>
        <Link href="/jewellery" className="mt-8 btn-gold">{t('empty.cta')}</Link>
      </div>
    );
  }

  return (
    <div className="container-luxury pt-24 lg:pt-28">
      <Breadcrumbs items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.wishlist') }]} />

      <h1 className="heading-serif text-3xl text-heading sm:text-4xl">{t('wishlist.title')}</h1>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.productId} className="group border border-border/10">
            <Link href={`/jewellery/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              </div>
            </Link>
            <div className="p-3">
              <Link href={`/jewellery/${item.slug}`}>
                <h3 className="truncate font-serif text-sm text-heading hover:text-gold">{item.name}</h3>
              </Link>
              <div className="mt-1">
                {showPrices ? (
                  <span className="text-xs text-secondary-text/70">{formatDisplayPrice(convertPrice(item.price, selectedCurrencyCode, rates, currencyInfo).amount, selectedCurrencyCode, currencies)}</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-secondary-text/60">{t('price.onRequest')}</span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    addItem({ productId: item.productId, slug: item.slug, name: item.name, sku: null, price: item.price, thumbnailUrl: item.thumbnailUrl, imageUrl: item.thumbnailUrl, quantity: 1 });
                    toast.success(`${item.name} — ${t('product.addToCart')}`);
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 border border-border/20 py-2 text-[10px] uppercase tracking-wider text-heading transition-colors hover:border-gold hover:text-gold"
                >
                  <ShoppingBag className="h-3 w-3" />
                  {t('wishlist.moveToCart')}
                </button>
                <button onClick={() => removeItem(item.productId)} aria-label={t('cart.removeItem')} className="flex h-8 w-8 items-center justify-center border border-border/20 text-secondary-text/70 transition-colors hover:border-red-300 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-10 text-center">
          <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold">
            <MessageCircle className="h-4 w-4" />
            {t('wishlist.whatsappEnquiry')}
          </a>
        </div>
      )}
    </div>
  );
}
