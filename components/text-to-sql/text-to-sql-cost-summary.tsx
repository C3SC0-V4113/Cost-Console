'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { SourceTag } from '@/components/help/source-tag';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { TextToSqlCostResult } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

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
  overridden = false,
}: Readonly<{
  result: TextToSqlCostResult | null;
  benchmark: TextToSqlBenchmarkDTO | null;
  overridden?: boolean;
}>) {
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
  const detailScenario = result.scenarios[result.scenarios.length - 1];
  const accuracy = result.accuracy;
  const hasAccuracy = accuracy !== null;
  // Two columns without accuracy, three with it.
  const tableCols = hasAccuracy
    ? 'grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]'
    : 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]';

  return (
    <div className="grid gap-4">
      {/* Scenario comparison — only the scenarios the selection supports. */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div
          className={`grid ${tableCols} gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase`}
        >
          <span>{t('summary.scenario')}</span>
          {hasAccuracy ? <span className="text-right">{t('summary.accuracy')}</span> : null}
          <span className="text-right">{t('summary.perMonth')}</span>
        </div>
        <div className="divide-y divide-border">
          {result.scenarios.map((scenario) => (
            <div
              key={scenario.key}
              className={`grid ${tableCols} items-center gap-4 px-4 py-3 text-sm`}
            >
              <span className="font-medium text-foreground">{t(`scenarios.${scenario.key}`)}</span>
              {hasAccuracy ? (
                <span className="text-right text-muted-foreground tabular-nums">
                  {scenario.accuracyPercentage === null ? '—' : `${scenario.accuracyPercentage}%`}
                </span>
              ) : null}
              <span className="text-right font-medium text-foreground tabular-nums">
                {formatCurrency(scenario.monthlyCost)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy is a source-backed result; the source sits on its own line.
          A raw-only benchmark shows just the baseline; an override marks the
          figures as manually adjusted, visually distinct from the cited value. */}
      {accuracy && benchmark ? (
        <div className="grid gap-3 rounded-xl border border-border bg-muted p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="grid gap-0.5">
              <span className="text-xs text-muted-foreground">{t('summary.baselineAccuracy')}</span>
              <span className="font-semibold text-foreground tabular-nums">
                {accuracy.baselinePercentage}%
              </span>
            </div>
            {accuracy.semanticPercentage !== null ? (
              <div className="grid gap-0.5">
                <span className="text-xs text-muted-foreground">
                  {t('summary.semanticAccuracy')}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {accuracy.semanticPercentage}%
                </span>
              </div>
            ) : null}
            {accuracy.deltaPercentage !== null ? (
              <div className="grid gap-0.5">
                <span className="text-xs text-muted-foreground">{t('summary.accuracyDelta')}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-fit cursor-help font-semibold text-foreground tabular-nums underline decoration-muted-foreground/60 decoration-dotted underline-offset-4">
                      {signed(Number(accuracy.deltaPercentage.toFixed(1)))}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{signed(accuracy.deltaPercentage)}%</TooltipContent>
                </Tooltip>
              </div>
            ) : null}
          </div>
          {overridden ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">{t('summary.manualOverride')}</Badge>
              <span className="text-muted-foreground">
                {t('summary.basedOn')} {benchmark.benchmark} · {benchmark.provider}{' '}
                {benchmark.model}
              </span>
            </div>
          ) : (
            <div className="grid gap-1.5 text-xs">
              <span className="text-muted-foreground">
                {t('summary.accuracySource')} {benchmark.benchmark} · {benchmark.provider}{' '}
                {benchmark.model}
              </span>
              <div>
                <SourceTag source={benchmark.source} />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Per-question line items for the most complete selected scenario. */}
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
          label={t('summary.cacheHitPercentage')}
          value={`${result.assumptions.promptCacheHitPercentage}%`}
        />
      </dl>
    </div>
  );
}
