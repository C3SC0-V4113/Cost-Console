'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { RagCostResult } from '@/lib/calc/rag-cost';

function Assumption({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function RagCostSummary({ result }: Readonly<{ result: RagCostResult | null }>) {
  const t = useTranslations('rag');
  const tItems = useTranslations('costSummary');
  const format = useFormatter();
  const formatCurrency = useCurrencyFormat(result?.currency ?? 'USD');

  if (!result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        {t('summary.selectModel')}
      </div>
    );
  }

  const tokens = (value: string): string => format.number(Number(value));

  // costPerQuery is nested under `query`; the others are top-level recurring
  // rollups. Resolve values explicitly so the labels stay data-driven.
  const recurringRollups = [
    { labelKey: 'perQuery', value: result.query.costPerQuery },
    { labelKey: 'perDay', value: result.dailyQueryCost },
    { labelKey: 'perMonth', value: result.monthlyQueryCost },
    { labelKey: 'perYear', value: result.yearlyQueryCost },
  ];

  return (
    <div className="grid gap-4">
      {/* One-time ingestion, kept separate from recurring query cost (views.md). */}
      <div className="grid gap-2 rounded-2xl border border-border bg-muted p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t('summary.oneTimeIngestion')}
          </span>
          <span className="text-xl font-semibold text-foreground tabular-nums">
            {formatCurrency(result.ingestion.cost)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('summary.ingestionDetail', {
            chunks: tokens(result.ingestion.expectedChunks),
            tokens: tokens(result.ingestion.totalEmbeddingTokens),
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {recurringRollups.map((rollup) => (
          <div key={rollup.labelKey} className="grid gap-1 rounded-md bg-muted p-4">
            <span className="text-xs text-muted-foreground">{t(`summary.${rollup.labelKey}`)}</span>
            <span className="text-xl font-semibold text-foreground tabular-nums">
              {formatCurrency(rollup.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Per-query breakdown: query embedding + retrieved-context generation. */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid">
          <span>{t('summary.lineItem')}</span>
          <span className="text-right">{t('summary.tokens')}</span>
          <span className="text-right">{t('summary.costPerQuery')}</span>
        </div>
        <div className="divide-y divide-border">
          <div className="flex flex-col gap-1 px-4 py-3 text-sm sm:grid sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:items-center sm:gap-4">
            <span className="font-medium text-foreground">{t('summary.queryEmbedding')}</span>
            <span className="text-muted-foreground sm:text-right">
              {tokens(result.query.queryEmbeddingTokens)}
            </span>
            <span className="font-medium text-foreground sm:text-right">
              {formatCurrency(result.query.queryEmbeddingCost)}
            </span>
          </div>
          {result.query.generation.lineItems.map((item) => (
            <div
              key={item.category}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:grid sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:items-center sm:gap-4"
            >
              <span className="font-medium text-foreground">
                {tItems(`lineItems.${item.category}`)}
              </span>
              <span className="text-muted-foreground sm:text-right">
                {tokens(item.tokensPerInteraction)}
              </span>
              <span className="font-medium text-foreground sm:text-right">
                {formatCurrency(item.costPerInteraction)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional storage cost — never invented when no source-backed price exists. */}
      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
        <span className="text-muted-foreground">{t('summary.storage')}</span>
        {result.storage.available ? (
          <span className="font-medium text-foreground tabular-nums">
            {formatCurrency(result.storage.monthlyCost)}
            {t('summary.perMonthSuffix')}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('summary.storageUnavailable')}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1 rounded-md border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">{t('summary.monthlyTotal')}</span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {formatCurrency(result.monthlyTotal)}
          </span>
        </div>
        <div className="grid gap-1 rounded-md border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">{t('summary.yearlyTotal')}</span>
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {formatCurrency(result.yearlyTotal)}
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <Assumption label={t('summary.embeddingModel')} value={result.query.embeddingModel} />
        <Assumption
          label={t('summary.generationModel')}
          value={result.assumptions.generationModel}
        />
        <Assumption label={t('summary.currency')} value={result.currency} />
        <Assumption label={t('summary.topK')} value={String(result.assumptions.topK)} />
        <Assumption
          label={t('summary.queriesPerDay')}
          value={String(result.assumptions.queriesPerDay)}
        />
        <Assumption
          label={t('summary.cacheHitPercentage')}
          value={`${result.assumptions.promptCacheHitPercentage}%`}
        />
      </dl>
    </div>
  );
}
