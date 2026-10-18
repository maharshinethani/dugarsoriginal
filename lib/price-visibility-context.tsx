'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/lib/settings-context';

interface PriceVisibilityContextValue {
  showPrices: boolean;
  loading: boolean;
}

const PriceVisibilityContext = createContext<PriceVisibilityContextValue | undefined>(undefined);

export function PriceVisibilityProvider({ children }: { children: ReactNode }) {
  const { settings, loading } = useSettings();

  const showPrices = settings?.show_prices ?? false;

  return (
    <PriceVisibilityContext.Provider value={{ showPrices, loading }}>
      {children}
    </PriceVisibilityContext.Provider>
  );
}

export function usePriceVisibility() {
  const ctx = useContext(PriceVisibilityContext);
  if (!ctx) throw new Error('usePriceVisibility must be used within PriceVisibilityProvider');
  return ctx;
}
