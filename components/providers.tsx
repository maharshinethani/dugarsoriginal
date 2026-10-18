'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/locale-context';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';
import { SettingsProvider } from '@/lib/settings-context';
import { CurrencyProvider } from '@/lib/currency-context';
import { PriceVisibilityProvider } from '@/lib/price-visibility-context';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <LocaleProvider>
        <CurrencyProvider>
          <PriceVisibilityProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    className: 'theme-toast',
                  }}
                />
              </WishlistProvider>
            </CartProvider>
          </PriceVisibilityProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </SettingsProvider>
  );
}
