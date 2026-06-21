'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { calculateRagCost } from '@/app/(private)/rag/actions';
import { ModelSelect, NumberField, Section } from '@/components/calc/calculator-fields';
import { HelpTip } from '@/components/help/help-tip';
import { TokenLab } from '@/components/help/token-lab';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

import { RagCostSummary } from './rag-cost-summary';
import { DEFAULT_RAG_INPUTS } from './rag-inputs';

import type { RagCalculatorInputs } from './rag-inputs';
import type { RagCostResult } from '@/lib/calc/rag-cost';
import type { RagRetrievalBenchmarkDTO } from '@/lib/data/dto';

export type RagModelOption = {
  id: string;
  provider: string;
  model: string;
  // A cited MTEB retrieval score, attached to embedding models that have one.
  retrieval?: RagRetrievalBenchmarkDTO | null;
};

const RECOMPUTE_DEBOUNCE_MS = 250;
const MAX_DAYS_PER_MONTH = 31;

export function RagCostCalculator({
  embeddingModels,
  generationModels,
  defaultResult,
}: Readonly<{
  embeddingModels: RagModelOption[];
  generationModels: RagModelOption[];
  defaultResult: RagCostResult | null;
}>) {
  const t = useTranslations('help');
  const tr = useTranslations('rag');
  const [inputs, setInputs] = useState<RagCalculatorInputs>(() => ({
    ingestionEmbeddingModel: embeddingModels[0]?.id ?? '',
    queryEmbeddingModel: embeddingModels[0]?.id ?? '',
    generationModel: generationModels[0]?.id ?? '',
    ...DEFAULT_RAG_INPUTS,
  }));
  const [result, setResult] = useState<RagCostResult | null>(defaultResult);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function recompute(next: RagCalculatorInputs) {
    setIsCalculating(true);
    const response = await calculateRagCost(next);
    setResult(response.ok ? response.result : null);
    setIsCalculating(false);
  }

  function update(patch: Partial<RagCalculatorInputs>) {
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
  const retrieval =
    embeddingModels.find((option) => option.id === inputs.ingestionEmbeddingModel)?.retrieval ??
    null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="grid gap-5">
        <Section title={tr('sectionModels')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ModelSelect
              id="rag-embedding-model"
              label={tr('embeddingModelLabel')}
              value={inputs.ingestionEmbeddingModel}
              options={embeddingModels}
              placeholder={tr('embeddingModelPlaceholder')}
              // One embedding model serves both ingestion and query in the common setup.
              onChange={(value) =>
                update({ ingestionEmbeddingModel: value, queryEmbeddingModel: value })
              }
            />
            <ModelSelect
              id="rag-generation-model"
              label={tr('generationModelLabel')}
              value={inputs.generationModel}
              options={generationModels}
              placeholder={tr('generationModelPlaceholder')}
              onChange={(value) => update({ generationModel: value })}
            />
          </div>
        </Section>

        <Section
          title={tr('sectionIngestion')}
          help={<HelpTip label={t('ingestion.label')}>{t('ingestion.body')}</HelpTip>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="document-count"
              label={tr('documentCount')}
              value={inputs.documentCount}
              onChange={(value) => update({ documentCount: value })}
            />
            <NumberField
              id="avg-document-tokens"
              label={tr('avgDocumentTokens')}
              value={inputs.avgDocumentTokens}
              onChange={(value) => update({ avgDocumentTokens: value })}
            />
            <NumberField
              id="cleanup-retention"
              label={tr('cleanupRetention')}
              value={inputs.cleanupRetentionPercentage}
              onChange={(value) => update({ cleanupRetentionPercentage: Math.min(100, value) })}
              help={
                <HelpTip label={t('cleanupRetention.label')}>{t('cleanupRetention.body')}</HelpTip>
              }
            />
            <NumberField
              id="chunk-size"
              label={tr('chunkSize')}
              value={inputs.chunkSize}
              onChange={(value) => update({ chunkSize: value })}
              help={<HelpTip label={t('chunking.label')}>{t('chunking.body')}</HelpTip>}
            />
            <NumberField
              id="chunk-overlap"
              label={tr('chunkOverlap')}
              value={inputs.chunkOverlap}
              onChange={(value) => update({ chunkOverlap: value })}
            />
          </div>
          <TokenLab />
        </Section>

        <Section title={tr('sectionQuery')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="queries-per-day"
              label={tr('queriesPerDay')}
              value={inputs.queriesPerDay}
              onChange={(value) => update({ queriesPerDay: value })}
            />
            <NumberField
              id="rag-days-per-month"
              label={tr('daysPerMonth')}
              value={inputs.daysPerMonth}
              onChange={(value) => update({ daysPerMonth: Math.min(MAX_DAYS_PER_MONTH, value) })}
            />
            <NumberField
              id="avg-query-tokens"
              label={tr('avgQueryTokens')}
              value={inputs.avgQueryTokens}
              onChange={(value) => update({ avgQueryTokens: value })}
            />
            <NumberField
              id="top-k"
              label={tr('topK')}
              value={inputs.topK}
              onChange={(value) => update({ topK: value })}
              help={<HelpTip label={t('topK.label')}>{t('topK.body')}</HelpTip>}
            />
            <NumberField
              id="avg-retrieved-chunk-tokens"
              label={tr('avgRetrievedChunkTokens')}
              value={inputs.avgRetrievedChunkTokens}
              onChange={(value) => update({ avgRetrievedChunkTokens: value })}
              help={
                <HelpTip label={t('retrievedContext.label')}>{t('retrievedContext.body')}</HelpTip>
              }
            />
          </div>
        </Section>

        <Section
          title={tr('sectionGeneration')}
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
              id="rag-system-prompt-tokens"
              label={tr('systemPromptTokens')}
              value={inputs.systemPromptTokens}
              onChange={(value) => update({ systemPromptTokens: value })}
              help={
                <HelpTip label={t('systemPromptTokens.label')}>
                  {t('systemPromptTokens.body')}
                </HelpTip>
              }
            />
            <NumberField
              id="expected-output-tokens"
              label={tr('expectedOutputTokens')}
              value={inputs.expectedOutputTokens}
              onChange={(value) => update({ expectedOutputTokens: value })}
              help={<HelpTip label={t('outputTokens.label')}>{t('outputTokens.body')}</HelpTip>}
            />
          </div>

          {isCacheAvailable ? (
            <div className="grid gap-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex min-h-5 items-center gap-1">
                  <Label htmlFor="rag-cache-hit">{tr('cacheHitRate')}</Label>
                  <HelpTip label={t('cacheHitRate.label')}>{t('cacheHitRate.body')}</HelpTip>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {inputs.promptCacheHitPercentage}%
                </span>
              </div>
              <Slider
                id="rag-cache-hit"
                value={[inputs.promptCacheHitPercentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => update({ promptCacheHitPercentage: values[0] ?? 0 })}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tr('cacheUnavailable', { provider: result?.query.generation.provider ?? '' })}
            </p>
          )}
        </Section>
      </div>

      <div className="grid content-start gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {tr('costSummary')}
          </h2>
          {isCalculating ? (
            <span className="text-xs text-muted-foreground">{tr('calculating')}</span>
          ) : null}
        </div>
        <RagCostSummary result={result} retrieval={retrieval} />
      </div>
    </div>
  );
}
