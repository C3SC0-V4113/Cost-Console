'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { calculateTextToSqlCost } from '@/app/(private)/text-to-sql/actions';
import { ModelSelect, NumberField, Section } from '@/components/calc/calculator-fields';
import { HelpTip } from '@/components/help/help-tip';
import { TokenLab } from '@/components/help/token-lab';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import { TextToSqlBenchmarkSection } from './text-to-sql-benchmark-section';
import { TextToSqlCostSummary } from './text-to-sql-cost-summary';
import {
  DEFAULT_TEXT_TO_SQL_INPUTS,
  NO_BENCHMARK_ID,
  overrideDefaults,
} from './text-to-sql-inputs';

import type { TextToSqlCalculatorInputs } from './text-to-sql-inputs';
import type { TextToSqlCostResult } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

export type TextToSqlModelOption = { id: string; provider: string; model: string };

const RECOMPUTE_DEBOUNCE_MS = 250;
const MAX_DAYS_PER_MONTH = 31;
const SEMANTIC_MODE_KEYS = ['none', 'headless', 'native'] as const;

export function TextToSqlCostCalculator({
  models,
  benchmarks,
  defaultResult,
  defaultBenchmark,
}: Readonly<{
  models: TextToSqlModelOption[];
  benchmarks: TextToSqlBenchmarkDTO[];
  defaultResult: TextToSqlCostResult | null;
  defaultBenchmark: TextToSqlBenchmarkDTO | null;
}>) {
  const t = useTranslations('help');
  const tt = useTranslations('textToSql');
  const [inputs, setInputs] = useState<TextToSqlCalculatorInputs>(() => ({
    model: models[0]?.id ?? '',
    benchmarkId: benchmarks[0]?.id ?? NO_BENCHMARK_ID,
    ...DEFAULT_TEXT_TO_SQL_INPUTS,
    ...overrideDefaults(defaultBenchmark),
  }));
  const [result, setResult] = useState<TextToSqlCostResult | null>(defaultResult);
  const [benchmark, setBenchmark] = useState<TextToSqlBenchmarkDTO | null>(defaultBenchmark);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function recompute(next: TextToSqlCalculatorInputs) {
    setIsCalculating(true);
    const response = await calculateTextToSqlCost(next);
    if (response.ok) {
      setResult(response.result);
      setBenchmark(response.benchmark);
    } else {
      setResult(null);
    }
    setIsCalculating(false);
  }

  function update(patch: Partial<TextToSqlCalculatorInputs>) {
    const next = { ...inputs, ...patch };
    setInputs(next);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void recompute(next);
    }, RECOMPUTE_DEBOUNCE_MS);
  }

  const isCacheAvailable = result?.cacheAvailable ?? true;
  const hasBenchmark = inputs.benchmarkId !== NO_BENCHMARK_ID;
  const selectedBenchmark = benchmarks.find((entry) => entry.id === inputs.benchmarkId) ?? null;
  // A paired benchmark (dbt, Cube) reports a semantic-layer figure; raw-only
  // ones (BIRD, Spider) do not, so the semantic scenario stays unavailable.
  const isPaired = selectedBenchmark?.semanticAccuracy != null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="grid gap-5">
        <Section title={tt('sectionModel')}>
          <ModelSelect
            id="text-to-sql-model"
            label={tt('modelLabel')}
            value={inputs.model}
            options={models}
            placeholder={tt('modelPlaceholder')}
            onChange={(value) => update({ model: value })}
          />
        </Section>

        <TextToSqlBenchmarkSection
          benchmarks={benchmarks}
          inputs={inputs}
          update={update}
          hasBenchmark={hasBenchmark}
          isPaired={isPaired}
        />

        <Section title={tt('sectionSchema')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="question-tokens"
              label={tt('questionTokens')}
              value={inputs.questionTokens}
              onChange={(value) => update({ questionTokens: value })}
            />
            <NumberField
              id="schema-context-tokens"
              label={tt('schemaContextTokens')}
              value={inputs.schemaContextTokens}
              onChange={(value) => update({ schemaContextTokens: value })}
              help={<HelpTip label={t('schemaContext.label')}>{t('schemaContext.body')}</HelpTip>}
            />
            <NumberField
              id="sql-output-tokens"
              label={tt('sqlOutputTokens')}
              value={inputs.sqlOutputTokens}
              onChange={(value) => update({ sqlOutputTokens: value })}
            />
            <NumberField
              id="validation-prompt-tokens"
              label={tt('validationPromptTokens')}
              value={inputs.validationPromptTokens}
              disabled={!isPaired || !inputs.includeRetry}
              onChange={(value) => update({ validationPromptTokens: value })}
              help={<HelpTip label={t('validationLoop.label')}>{t('validationLoop.body')}</HelpTip>}
            />
          </div>
          <TokenLab />
        </Section>

        <Section
          title={tt('sectionSemantic')}
          help={<HelpTip label={t('semanticLayer.label')}>{t('semanticLayer.body')}</HelpTip>}
        >
          {isPaired ? null : (
            <p className="text-sm text-muted-foreground">{tt('semanticDisabled')}</p>
          )}
          <NumberField
            id="semantic-metadata-tokens"
            label={tt('semanticMetadataTokens')}
            value={inputs.semanticMetadataTokens}
            disabled={!isPaired}
            onChange={(value) => update({ semanticMetadataTokens: value })}
          />
          <dl className="grid gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs">
            {SEMANTIC_MODE_KEYS.map((mode) => (
              <div key={mode} className="grid gap-0.5">
                <dt className="font-medium text-foreground">{tt(`semanticModes.${mode}`)}</dt>
                <dd className="text-muted-foreground">{tt(`semanticModeHelp.${mode}`)}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          title={tt('sectionWorkload')}
          help={
            <HelpTip
              level="info"
              label={t('promptCaching.label')}
              sourceHref="https://platform.openai.com/docs/guides/prompt-caching"
              sourceLabel={t('promptCaching.sourceLabel')}
            >
              {t('promptCaching.body')}
            </HelpTip>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="questions-per-day"
              label={tt('questionsPerDay')}
              value={inputs.questionsPerDay}
              onChange={(value) => update({ questionsPerDay: value })}
            />
            <NumberField
              id="text-to-sql-days-per-month"
              label={tt('daysPerMonth')}
              value={inputs.daysPerMonth}
              onChange={(value) => update({ daysPerMonth: Math.min(MAX_DAYS_PER_MONTH, value) })}
            />
            <NumberField
              id="max-repair-attempts"
              label={tt('maxRepairAttempts')}
              value={inputs.maxRepairAttempts}
              disabled={!isPaired || !inputs.includeRetry}
              onChange={(value) => update({ maxRepairAttempts: value })}
              help={<HelpTip label={t('validationLoop.label')}>{t('validationLoop.body')}</HelpTip>}
            />
          </div>

          {isCacheAvailable ? (
            <div className="grid gap-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex min-h-5 items-center gap-1">
                  <Label htmlFor="text-to-sql-cache-hit">{tt('cacheHitRate')}</Label>
                  <HelpTip label={t('cacheHitRate.label')}>{t('cacheHitRate.body')}</HelpTip>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {inputs.promptCacheHitPercentage}%
                </span>
              </div>
              <Slider
                id="text-to-sql-cache-hit"
                value={[inputs.promptCacheHitPercentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => update({ promptCacheHitPercentage: values[0] ?? 0 })}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tt('cacheUnavailable', { provider: result?.assumptions.provider ?? '' })}
            </p>
          )}
        </Section>
      </div>

      <div className="grid content-start gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {tt('costSummary')}
          </h2>
          {isCalculating ? (
            <span className="text-xs text-muted-foreground">{tt('calculating')}</span>
          ) : null}
        </div>
        <TextToSqlCostSummary
          result={result}
          benchmark={benchmark}
          overridden={inputs.overrideAccuracy}
        />
      </div>
    </div>
  );
}
