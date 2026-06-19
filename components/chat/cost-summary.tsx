'use client';

import { useTranslations } from 'next-intl';

import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { ChatCostResult } from '@/lib/calc/chat-cost';

const ROLLUPS = [
  { key: 'costPerInteraction', labelKey: 'perInteraction' },
  { key: 'dailyCost', labelKey: 'perDay' },
  { key: 'monthlyCost', labelKey: 'perMonth' },
  { key: 'yearlyCost', labelKey: 'perYear' },
] as const;

function Assumption({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CostSummary({ result }: Readonly<{ result: ChatCostResult | null }>) {
  const t = useTranslations('costSummary');
  const formatCurrency = useCurrencyFormat(result?.currency ?? 'USD');

  if (!result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        {t('selectModel')}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        {ROLLUPS.map((rollup) => (
          <div key={rollup.key} className="grid gap-1 rounded-md bg-muted p-4">
            <span className="text-xs text-muted-foreground">{t(rollup.labelKey)}</span>
            <span className="text-xl font-semibold text-foreground tabular-nums">
              {formatCurrency(result[rollup.key])}
            </span>
          </div>
        ))}
      </div>

      {result.cacheAvailable ? null : (
        <p className="text-xs text-muted-foreground">
          {t('cacheUnavailableNote', { provider: result.provider, model: result.model })}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid">
          <span>{t('lineItem')}</span>
          <span className="text-right">{t('tokens')}</span>
          <span className="text-right">{t('unitPrice')}</span>
          <span className="text-right">{t('costPerInteraction')}</span>
        </div>
        <div className="divide-y divide-border">
          {result.lineItems.map((item) => (
            <div
              key={item.category}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:grid sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] sm:items-center sm:gap-4"
            >
              <span className="font-medium text-foreground">{t(`lineItems.${item.category}`)}</span>
              <span className="text-muted-foreground sm:text-right">
                <span className="sm:hidden">{t('tokensMobile')}</span>
                {item.tokensPerInteraction}
              </span>
              <span className="text-muted-foreground sm:text-right">
                <span className="sm:hidden">{t('unitMobile')}</span>
                {formatCurrency(item.unitPrice)}/1M
              </span>
              <span className="font-medium text-foreground sm:text-right">
                <span className="font-normal text-muted-foreground sm:hidden">
                  {t('costMobile')}
                </span>
                {formatCurrency(item.costPerInteraction)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <Assumption label={t('provider')} value={result.assumptions.provider} />
        <Assumption label={t('model')} value={result.assumptions.model} />
        <Assumption label={t('currency')} value={result.assumptions.currency} />
        <Assumption
          label={t('interactionsPerDay')}
          value={String(result.assumptions.interactionsPerDay)}
        />
        <Assumption label={t('daysPerMonth')} value={String(result.assumptions.daysPerMonth)} />
        <Assumption
          label={t('cacheHitPercentage')}
          value={`${result.assumptions.promptCacheHitPercentage}%`}
        />
      </dl>
    </div>
  );
}
