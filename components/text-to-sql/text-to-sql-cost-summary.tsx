'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { SourceTag } from '@/components/help/source-tag';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { TextToSqlCostResult, TextToSqlScenarioKey } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

const SCENARIO_ORDER: readonly TextToSqlScenarioKey[] = ['raw', 'semantic', 'semanticRetry'];

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function Assumption({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function TextToSqlCostSummary({
  result,
  benchmark,
}: Readonly<{ result: TextToSqlCostResult | null; benchmark: TextToSqlBenchmarkDTO | null }>) {
  const t = useTranslations('textToSql');
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
  const detailScenario = result.scenarios.semanticRetry;
  const delta = result.accuracy.deltaPercentage;
  // Show one decimal (trailing zero stripped) to avoid overflow; the tooltip
  // carries the full value.
  const deltaDisplay = signed(Number(delta.toFixed(1)));
  const deltaFull = `${signed(delta)}%`;

  return (
    <div className="grid gap-4">
      {/* Three-way scenario comparison (views.md): raw vs semantic vs +retry. */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <span>{t('summary.scenario')}</span>
          <span className="text-right">{t('summary.accuracy')}</span>
          <span className="text-right">{t('summary.perMonth')}</span>
        </div>
        <div className="divide-y divide-border">
          {SCENARIO_ORDER.map((key) => {
            const scenario = result.scenarios[key];
            return (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] items-center gap-4 px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">{t(`scenarios.${key}`)}</span>
                <span className="text-right text-muted-foreground tabular-nums">
                  {scenario.accuracyPercentage}%
                </span>
                <span className="text-right font-medium text-foreground tabular-nums">
                  {formatCurrency(scenario.monthlyCost)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accuracy is a source-backed result from the selected benchmark. */}
      <div className="grid gap-3 rounded-xl border border-border bg-muted p-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">{t('summary.baselineAccuracy')}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {result.accuracy.baselinePercentage}%
            </span>
          </div>
          <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">{t('summary.semanticAccuracy')}</span>
            <span className="font-semibold text-foreground tabular-nums">
              {result.accuracy.semanticPercentage}%
            </span>
          </div>
          <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">{t('summary.accuracyDelta')}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-fit cursor-default font-semibold text-foreground tabular-nums">
                  {deltaDisplay}%
                </span>
              </TooltipTrigger>
              <TooltipContent>{deltaFull}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        {benchmark ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">{t('summary.accuracySource')}</span>
            <span className="font-medium text-foreground">
              {benchmark.benchmark} · {benchmark.provider} {benchmark.model}
            </span>
            <Badge variant="secondary">
              {benchmark.isOfficial ? t('summary.official') : t('summary.vendor')}
            </Badge>
            <SourceTag source={benchmark.source} />
          </div>
        ) : null}
      </div>

      {/* Per-question line items for the full semantic + validation/retry scenario. */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid">
          <span>{t('summary.lineItem')}</span>
          <span className="text-right">{t('summary.tokens')}</span>
          <span className="text-right">{t('summary.perQuestion')}</span>
        </div>
        <div className="divide-y divide-border">
          {detailScenario.lineItems.map((item) => (
            <div
              key={item.category}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:grid sm:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))] sm:items-center sm:gap-4"
            >
              <span className="font-medium text-foreground">{t(`lineItems.${item.category}`)}</span>
              <span className="text-muted-foreground sm:text-right">{tokens(item.tokens)}</span>
              <span className="font-medium text-foreground sm:text-right">
                {formatCurrency(item.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional warehouse execution cost — never invented when no price exists. */}
      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
        <span className="text-muted-foreground">{t('summary.warehouse')}</span>
        {detailScenario.warehouse.available ? (
          <span className="font-medium text-foreground tabular-nums">
            {formatCurrency(detailScenario.warehouse.costPerQuestion)}
            {t('summary.perQuestionSuffix')}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('summary.warehouseUnavailable')}</span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <Assumption label={t('summary.model')} value={result.assumptions.model} />
        <Assumption label={t('summary.currency')} value={result.currency} />
        <Assumption
          label={t('summary.questionsPerDay')}
          value={String(result.assumptions.questionsPerDay)}
        />
        <Assumption
          label={t('summary.maxRepairAttempts')}
          value={String(result.assumptions.maxRepairAttempts)}
        />
        <Assumption
          label={t('summary.cacheHitPercentage')}
          value={`${result.assumptions.promptCacheHitPercentage}%`}
        />
      </dl>
    </div>
  );
}
