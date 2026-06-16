// Shared formatting helpers. Dates arrive from the repository as ISO strings and
// are formatted in UTC so server-rendered output is deterministic.

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return dateFormatter.format(new Date(iso));
}

// Currency formatters are cached by currency + precision so Intl.NumberFormat is
// not rebuilt on every call.
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string, maximumFractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${maximumFractionDigits}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    // eslint-disable-next-line react-doctor/js-hoist-intl -- cached per currency+precision, not rebuilt per call
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

// Formats a decimal-string money value. Per-interaction costs can be tiny, so
// sub-unit amounts keep more fraction digits while larger totals round to cents.
export function formatCurrency(value: string, currency: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }

  const absolute = Math.abs(amount);
  const maximumFractionDigits = absolute > 0 && absolute < 1 ? 6 : 2;

  try {
    return getCurrencyFormatter(currency, maximumFractionDigits).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
