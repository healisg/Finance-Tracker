import { useState, useEffect } from 'react';
import type { Currency } from '@/components/modals/settings-modal';

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('GBP');

  useEffect(() => {
    // Load saved currency from localStorage, default to GBP
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'GBP')) {
      setCurrency(savedCurrency);
    } else {
      // Set default to GBP if no saved preference
      localStorage.setItem('currency', 'GBP');
    }

    // Listen for currency changes
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return { currency, formatCurrency };
}