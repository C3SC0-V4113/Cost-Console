'use client';

import { useFormatter } from 'next-intl';

// Locale-aware currency formatting for serialized Decimal strings. Sub-unit
// amounts (per-token prices) keep up to 6 fraction digits so tiny costs stay
// legible, while larger totals round to cents. Returns an em dash for missing or
// non-numeric values. Shared by the chat cost summary and the pricing catalog so
// regional formatting lives in one place.
export function useCurrencyFormat(currency: string): (value: string | null) => string {
  const format = useFormatter();

  return (value: string | null) => {
    if (value === null) {
      return '—';
    }

    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return '—';
    }

    const absolute = Math.abs(amount);
    const maximumFractionDigits = absolute > 0 && absolute < 1 ? 6 : 2;

    try {
      return format.number(amount, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits,
      });
    } catch {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };
}
