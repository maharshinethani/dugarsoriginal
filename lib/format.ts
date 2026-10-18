import type { Product, Currency, ProductCountryPrice } from '@/lib/types';

export function formatPrice(
  price: number,
  currencyCode = 'USD',
  currencyInfo?: Currency
): string {
  if (!currencyInfo) {
    const symbols: Record<string, string> = {
      USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SAR: 'SAR ',
      KWD: 'KWD ', QAR: 'QAR ', OMR: 'OMR ', BHD: 'BHD ', INR: '₹',
    };
    const symbol = symbols[currencyCode] || `${currencyCode} `;
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  const decimals = currencyInfo.decimal_places;
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (currencyInfo.symbol_position === 'after') {
    return `${formatted} ${currencyInfo.symbol}`;
  }
  return `${currencyInfo.symbol}${formatted}`;
}

export function getDisplayName(product: Product, locale: 'en' | 'ar'): string {
  if (locale === 'ar' && product.name_ar) return product.name_ar;
  return product.name_en;
}

export function getProductPrice(product: Product): { current: number; original: number | null; isOnSale: boolean } {
  const current = product.sale_price || product.price;
  const original = product.sale_price ? product.price : product.compare_price;
  return { current, original, isOnSale: !!product.sale_price };
}

export function convertPrice(
  basePrice: number,
  targetCurrencyCode: string,
  rates: Record<string, number>,
  currencyInfo?: Currency
): { amount: number; currencyCode: string; currencyInfo?: Currency } {
  const rate = rates[targetCurrencyCode] ?? 1;
  const converted = basePrice * rate;
  const decimals = currencyInfo?.decimal_places ?? 2;
  const rounded = Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return { amount: rounded, currencyCode: targetCurrencyCode, currencyInfo };
}

export function getProductDisplayPrice(
  product: Product,
  selectedCurrencyCode: string,
  rates: Record<string, number>,
  currencies: Currency[],
  countryPrices?: ProductCountryPrice[]
): { current: number; original: number | null; isOnSale: boolean; displayCurrency: string } {
  const baseCurrent = product.sale_price || product.price;
  const baseOriginal = product.sale_price ? product.price : product.compare_price;
  const isOnSale = !!product.sale_price;

  if (countryPrices && countryPrices.length > 0) {
    const cp = countryPrices.find((p) => p.currency_code === selectedCurrencyCode);
    if (cp) {
      const cpCurrent = cp.sale_price ?? cp.price;
      const cpOriginal = cp.sale_price ? cp.price : null;
      return { current: cpCurrent, original: cpOriginal, isOnSale: !!cp.sale_price, displayCurrency: selectedCurrencyCode };
    }
  }

  const targetCurrency = currencies.find((c) => c.code === selectedCurrencyCode);
  const converted = convertPrice(baseCurrent, selectedCurrencyCode, rates, targetCurrency);
  const originalConverted = baseOriginal
    ? convertPrice(baseOriginal, selectedCurrencyCode, rates, targetCurrency)
    : null;

  return {
    current: converted.amount,
    original: originalConverted?.amount ?? null,
    isOnSale,
    displayCurrency: selectedCurrencyCode,
  };
}

export function formatDisplayPrice(
  amount: number,
  currencyCode: string,
  currencies: Currency[]
): string {
  const info = currencies.find((c) => c.code === currencyCode);
  return formatPrice(amount, currencyCode, info);
}
