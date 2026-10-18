'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useSettings } from '@/lib/settings-context';
import { useCurrency } from '@/lib/currency-context';
import { usePriceVisibility } from '@/lib/price-visibility-context';
import { getWhatsAppUrl, getPrimaryImageUrl, normalizeUrl } from '@/lib/whatsapp';
import { supabase } from '@/lib/supabase';
import { formatDisplayPrice, getDisplayName, getProductDisplayPrice } from '@/lib/format';
import type { Product, ProductMedia } from '@/lib/types';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductCard } from '@/components/product-card';
import { PremiumGallery } from '@/components/premium-gallery';
import { ShoppingBag, Heart, Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { locale, t } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const { whatsappNumber, getWhatsappForPurpose } = useSettings();
  const { selectedCurrencyCode, rates, currencies, selectedCountry } = useCurrency();
  const { showPrices } = usePriceVisibility();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productMedia, setProductMedia] = useState<ProductMedia[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [origin, setOrigin] = useState<string | undefined>(undefined);

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : undefined);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, collection:collection_id(*), product_images(*), product_media(*)')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (data) {
          const prod = data as Product;
          setProduct(prod);
          setSelectedSize(prod.sizes?.[0] || '');
          setSelectedColour(prod.colours?.[0] || '');

          // Build unified media list from product_media, fallback to product_images
          const pm = (prod as any).product_media as ProductMedia[] | undefined;
          if (pm && pm.length > 0) {
            const sorted = pm.sort((a, b) => a.position - b.position);
            setProductMedia(sorted);
          } else {
            // Fallback: construct from product_images + thumbnail
            const imgs = (prod.product_images || []).sort((a, b) => a.position - b.position);
            const fallback: ProductMedia[] = imgs.map((img, i) => ({
              id: img.id,
              product_id: prod.id,
              media_type: 'image' as const,
              url: img.url,
              storage_path: null,
              file_name: null,
              file_size: null,
              mime_type: null,
              alt_en: img.alt_en,
              alt_ar: img.alt_ar,
              position: i,
              is_primary: i === 0,
              created_at: '',
              updated_at: '',
            }));
            if (fallback.length === 0 && prod.thumbnail_url) {
              fallback.push({
                id: 'thumb',
                product_id: prod.id,
                media_type: 'image',
                url: prod.thumbnail_url,
                storage_path: null, file_name: null, file_size: null, mime_type: null,
                alt_en: null, alt_ar: null, position: 0, is_primary: true,
                created_at: '', updated_at: '',
              });
            }
            setProductMedia(fallback);
          }

          const relFilters: string[] = [];
          if (prod.category) relFilters.push(`category.eq.${prod.category}`);
          if (prod.collection_id) relFilters.push(`collection_id.eq.${prod.collection_id}`);

          const relatedQuery = relFilters.length > 0
            ? supabase.from('products').select('*, product_images(*)').eq('status', 'published').neq('id', prod.id).or(relFilters.join(',')).limit(4)
            : supabase.from('products').select('*, product_images(*)').eq('status', 'published').neq('id', prod.id).limit(4);

          const [cpRes, relRes] = await Promise.all([
            supabase.from('product_country_prices').select('*').eq('product_id', prod.id),
            relatedQuery,
          ]);

          if (cpRes.data) {
            prod.country_prices = cpRes.data as any;
          }
          setRelated((relRes.data as Product[]) || []);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-luxury pt-24 lg:pt-28">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse bg-muted" />
            <div className="h-4 w-1/3 animate-pulse bg-muted" />
            <div className="h-24 w-full animate-pulse bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-luxury flex min-h-[60vh] flex-col items-center justify-center pt-24 text-center">
        <h1 className="heading-serif text-3xl text-heading">Product not found</h1>
        <Link href="/jewellery" className="mt-6 btn-gold">{t('empty.cta')}</Link>
      </div>
    );
  }

  const name = getDisplayName(product, locale);
  const { current, original, isOnSale, displayCurrency } = getProductDisplayPrice(product, selectedCurrencyCode, rates, currencies, product.country_prices);
  const inWishlist = hasItem(product.id);

  const primaryImageUrl = getPrimaryImageUrl(product.product_images, product.thumbnail_url, origin);
  const productUrl = normalizeUrl(`/jewellery/${product.slug}`, origin);
  const lineSubtotal = current * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name,
      sku: product.sku,
      price: current,
      thumbnailUrl: product.thumbnail_url,
      imageUrl: primaryImageUrl || null,
      quantity,
      size: selectedSize || undefined,
      colour: selectedColour || undefined,
    });
    toast.success(`${name} — ${t('product.addToCart')}`);
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

  const buyNowNumber = getWhatsappForPurpose('buy_now') || whatsappNumber;
  const enquiryNumber = getWhatsappForPurpose('product_enquiry') || whatsappNumber;

  const buyNowUrl = getWhatsAppUrl(
    { type: 'buy_now', productId: product.id, productName: name, sku: product.sku || undefined, quantity, size: selectedSize || undefined, colour: selectedColour || undefined, price: showPrices ? formatDisplayPrice(current, displayCurrency, currencies) : undefined, currency: showPrices ? displayCurrency : undefined, subtotal: showPrices ? formatDisplayPrice(lineSubtotal, displayCurrency, currencies) : undefined, imageUrl: primaryImageUrl, productUrl, locale },
    buyNowNumber
  );

  const enquiryUrl = getWhatsAppUrl(
    { type: 'product_enquiry', productId: product.id, productName: name, sku: product.sku || undefined, price: showPrices ? formatDisplayPrice(current, displayCurrency, currencies) : undefined, currency: showPrices ? displayCurrency : undefined, imageUrl: primaryImageUrl, productUrl, locale },
    enquiryNumber
  );

  const stockLabel = {
    in_stock: t('product.inStock'),
    low_stock: t('product.lowStock'),
    out_of_stock: t('product.outOfStock'),
    made_to_order: t('product.madeToOrder'),
  }[product.stock_status];

  return (
    <div className="pt-20 lg:pt-24">
      <div className="container-luxury">
        <Breadcrumbs items={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.jewellery'), href: '/jewellery' },
          { label: name },
        ]} />
      </div>

      <div className="container-luxury grid grid-cols-1 gap-8 pb-24 lg:grid-cols-2 lg:gap-12 lg:pb-16">
        {/* Premium Gallery */}
        <PremiumGallery media={productMedia} productName={name} productAlt={name} />

        {/* Info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_new_arrival && <Badge>{t('badge.new')}</Badge>}
              {product.is_bestseller && <Badge>{t('badge.bestseller')}</Badge>}
              {product.is_signature && <Badge>{t('badge.signature')}</Badge>}
              {product.is_bridal && <Badge>{t('badge.bridal')}</Badge>}
              {product.is_limited && <Badge>{t('badge.limited')}</Badge>}
              {isOnSale && showPrices && <Badge variant="gold">{t('badge.sale')}</Badge>}
            </div>

            <h1 className="mt-4 heading-serif text-3xl text-heading sm:text-4xl">{name}</h1>

            <div className="mt-3 flex items-center gap-3">
              {showPrices ? (
                <>
                  <span className="text-2xl font-light text-heading">{formatDisplayPrice(current, displayCurrency, currencies)}</span>
                  {original && original > current && (
                    <span className="text-sm text-secondary-text/40 line-through">{formatDisplayPrice(original, displayCurrency, currencies)}</span>
                  )}
                </>
              ) : (
                <span className="text-sm font-medium uppercase tracking-wider text-secondary-text/70">{t('price.onRequest')}</span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-secondary-text/85">
              {locale === 'ar' ? product.short_description_ar || product.short_description_en : product.short_description_en}
            </p>

            {/* Stock */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${product.stock_status === 'in_stock' ? 'bg-green-500' : product.stock_status === 'low_stock' ? 'bg-yellow-500' : product.stock_status === 'out_of_stock' ? 'bg-red-500' : 'bg-gold'}`} />
              <span className="text-xs uppercase tracking-wider text-secondary-text/85">{stockLabel}</span>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <p className="label-luxury text-secondary-text/80">{t('product.selectSize')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-11 border px-3 py-2 text-xs transition-colors ${selectedSize === size ? 'border-gold bg-gold text-soft-black' : 'border-border/20 text-heading hover:border-gold'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colours */}
            {product.colours?.length > 0 && (
              <div className="mt-6">
                <p className="label-luxury text-secondary-text/80">{t('product.selectColour')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colours?.map((colour) => (
                    <button key={colour} onClick={() => setSelectedColour(colour)} className={`border px-4 py-2 text-xs transition-colors ${selectedColour === colour ? 'border-gold bg-gold text-soft-black' : 'border-border/20 text-heading hover:border-gold'}`}>
                      {colour}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="label-luxury text-secondary-text/80">{t('product.quantity')}</p>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-10 w-10 items-center justify-center border border-border/20 text-heading transition-colors hover:border-gold">−</button>
                <span className="w-12 text-center text-sm font-medium text-heading">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex h-10 w-10 items-center justify-center border border-border/20 text-heading transition-colors hover:border-gold">+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.stock_status === 'out_of_stock'} className="btn-emerald flex-1 disabled:opacity-50">
                  <ShoppingBag className="h-4 w-4" />
                  {t('product.addToCart')}
                </button>
                <button onClick={handleWishlist} aria-label={t('product.addToWishlist')} className="flex h-11 w-11 items-center justify-center border border-border/20 transition-colors hover:border-gold">
                  <Heart className={`h-4 w-4 ${inWishlist ? 'fill-gold text-gold' : 'text-heading'}`} />
                </button>
              </div>
              <a href={buyNowUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full">
                <MessageCircle className="h-4 w-4" />
                {t('product.buyNow')}
              </a>
              <div className="flex gap-3">
                <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold flex-1">
                  {t('product.whatsappEnquiry')}
                </a>
                <Link href="/appointment" className="btn-outline-gold flex-1">
                  <Calendar className="h-4 w-4" />
                  {t('product.bookAppointment')}
                </Link>
              </div>
            </div>

            {/* Details */}
            <div className="mt-10 border-t border-border/10 pt-8">
              <h3 className="label-luxury text-heading">{t('product.description')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary-text/85">
                {locale === 'ar' ? product.description_ar || product.description_en : product.description_en}
              </p>
            </div>

            {/* Specs */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border/10 pt-8">
              {product.sku && <Spec label={t('product.sku')} value={product.sku} />}
              {product.material && <Spec label={t('product.material')} value={product.material} />}
              {product.metal && <Spec label={t('product.metal')} value={product.metal} />}
              {product.stone && <Spec label={t('product.stone')} value={product.stone} />}
              {product.carat && <Spec label={t('product.carat')} value={product.carat} />}
              {product.weight && <Spec label={t('product.weight')} value={product.weight} />}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="container-luxury border-t border-border/10 py-16">
          <h2 className="heading-serif text-2xl text-heading sm:text-3xl">{t('product.related')}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex border-t border-border/10 bg-card/95 backdrop-blur-sm lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button onClick={handleAddToCart} disabled={product.stock_status === 'out_of_stock'} className="flex flex-1 items-center justify-center gap-2 py-4 text-xs font-medium uppercase tracking-wider text-heading transition-colors hover:bg-muted disabled:opacity-50">
          <ShoppingBag className="h-4 w-4" />
          {t('product.addToCart')}
        </button>
        <a href={buyNowUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 bg-gold py-4 text-xs font-medium uppercase tracking-wider text-soft-black">
          <MessageCircle className="h-4 w-4" />
          {t('product.buyNow')}
        </a>
      </div>
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant?: 'gold' }) {
  return (
    <span className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${variant === 'gold' ? 'bg-gold text-soft-black' : 'bg-card text-body'}`}>
      {children}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-secondary-text/70">{label}</p>
      <p className="mt-1 text-sm text-heading">{value}</p>
    </div>
  );
}
