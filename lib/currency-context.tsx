'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Currency, Country, ExchangeRate } from '@/lib/types';

interface CurrencyContextValue {
  currencies: Currency[];
  countries: Country[];
  rates: Record<string, number>;
  selectedCountryCode: string;
  selectedCurrencyCode: string;
  selectedCountry: Country | null;
  selectedCurrency: Currency | null;
  setCountry: (code: string) => void;
  setCurrency: (code: string) => void;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const COUNTRY_KEY = 'dugars-country';
const CURRENCY_KEY = 'dugars-currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: currData }, { data: countryData }, { data: rateData }] = await Promise.all([
        supabase.from('currencies').select('*').eq('is_enabled', true).order('sort_order'),
        supabase.from('countries').select('*').eq('is_enabled', true).order('sort_order'),
        supabase.from('exchange_rates').select('*'),
      ]);

      const currList = (currData as Currency[]) || [];
      const countryList = (countryData as Country[]) || [];
      const rateMap: Record<string, number> = {};
      (rateData as ExchangeRate[])?.forEach((r) => {
        rateMap[r.currency_code] = r.rate;
      });

      setCurrencies(currList);
      setCountries(countryList);
      setRates(rateMap);

      const storedCountry = typeof window !== 'undefined' ? localStorage.getItem(COUNTRY_KEY) : null;
      const storedCurrency = typeof window !== 'undefined' ? localStorage.getItem(CURRENCY_KEY) : null;

      if (storedCountry && countryList.find((c) => c.code === storedCountry)) {
        setSelectedCountryCode(storedCountry);
        const country = countryList.find((c) => c.code === storedCountry)!;
        if (storedCurrency && currList.find((c) => c.code === storedCurrency)) {
          setSelectedCurrencyCode(storedCurrency);
        } else {
          setSelectedCurrencyCode(country.default_currency_code);
        }
      } else {
        const baseCurrency = currList.find((c) => c.is_base);
        const defaultCountry = countryList.find((c) => c.default_currency_code === baseCurrency?.code) || countryList[0];
        if (defaultCountry) {
          setSelectedCountryCode(defaultCountry.code);
          setSelectedCurrencyCode(defaultCountry.default_currency_code);
        }
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const setCountry = useCallback((code: string) => {
    const country = countries.find((c) => c.code === code);
    if (!country) return;
    setSelectedCountryCode(code);
    setSelectedCurrencyCode(country.default_currency_code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_KEY, code);
      localStorage.setItem(CURRENCY_KEY, country.default_currency_code);
    }
  }, [countries]);

  const setCurrency = useCallback((code: string) => {
    const currency = currencies.find((c) => c.code === code);
    if (!currency) return;
    setSelectedCurrencyCode(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_KEY, code);
    }
  }, [currencies]);

  const selectedCountry = countries.find((c) => c.code === selectedCountryCode) || null;
  const selectedCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || null;

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        countries,
        rates,
        selectedCountryCode,
        selectedCurrencyCode,
        selectedCountry,
        selectedCurrency,
        setCountry,
        setCurrency,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
