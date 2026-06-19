'use client';

import { Braces, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { calculateChatCost } from '@/app/(private)/chat/actions';
import { NumberField, Section } from '@/components/calc/calculator-fields';
import { HelpTip } from '@/components/help/help-tip';
import { TokenEstimator } from '@/components/help/token-estimator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { DEFAULT_CHAT_INPUTS } from './chat-inputs';
import { CostSummary } from './cost-summary';

import type { ChatCalculatorInputs } from './chat-inputs';
import type { ChatCostResult } from '@/lib/calc/chat-cost';

export type ChatModelOption = { id: string; provider: string; model: string };

const RECOMPUTE_DEBOUNCE_MS = 250;
const MAX_DAYS_PER_MONTH = 31;

export function ChatCostCalculator({
  models,
  defaultResult,
}: Readonly<{ models: ChatModelOption[]; defaultResult: ChatCostResult | null }>) {
  const t = useTranslations('help');
  const tc = useTranslations('chat');
  const tTokens = useTranslations('tokenLab');
  const [inputs, setInputs] = useState<ChatCalculatorInputs>(() => ({
    model: models[0]?.id ?? '',
    ...DEFAULT_CHAT_INPUTS,
  }));
  const [result, setResult] = useState<ChatCostResult | null>(defaultResult);
  const [isCalculating, setIsCalculating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function recompute(next: ChatCalculatorInputs) {
    setIsCalculating(true);
    const response = await calculateChatCost(next);
    setResult(response.ok ? response.result : null);
    setIsCalculating(false);
  }

  function update(patch: Partial<ChatCalculatorInputs>) {
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

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="grid gap-5">
        <Section title={tc('sectionModel')}>
          <div className="grid gap-1.5">
            <Label htmlFor="chat-model">{tc('modelLabel')}</Label>
            <Select value={inputs.model} onValueChange={(value) => update({ model: value })}>
              <SelectTrigger id="chat-model">
                <SelectValue placeholder={tc('modelPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {models.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.provider} · {option.model}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section title={tc('sectionVolume')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="interactions-per-day"
              label={tc('interactionsPerDay')}
              value={inputs.interactionsPerDay}
              onChange={(value) => update({ interactionsPerDay: value })}
              help={
                <HelpTip label={t('interactionsPerDay.label')}>
                  {t('interactionsPerDay.body')}
                </HelpTip>
              }
            />
            <NumberField
              id="days-per-month"
              label={tc('daysPerMonth')}
              value={inputs.daysPerMonth}
              onChange={(value) => update({ daysPerMonth: Math.min(MAX_DAYS_PER_MONTH, value) })}
            />
          </div>
        </Section>

        <Section title={tc('sectionTokens')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="system-prompt-tokens"
              label={tc('systemPromptTokens')}
              value={inputs.systemPromptTokens}
              onChange={(value) => update({ systemPromptTokens: value })}
              help={
                <HelpTip label={t('systemPromptTokens.label')}>
                  {t('systemPromptTokens.body')}
                </HelpTip>
              }
            />
            <NumberField
              id="user-input-tokens"
              label={tc('userInputTokens')}
              value={inputs.userInputTokens}
              onChange={(value) => update({ userInputTokens: value })}
            />
            <NumberField
              id="history-context-tokens"
              label={tc('historyContextTokens')}
              value={inputs.historyContextTokens}
              onChange={(value) => update({ historyContextTokens: value })}
              help={
                <HelpTip label={t('contextHistoryTokens.label')}>
                  {t('contextHistoryTokens.body')}
                </HelpTip>
              }
            />
            <NumberField
              id="cached-input-tokens"
              label={tc('cachedInputTokens')}
              value={inputs.cachedInputTokens}
              onChange={(value) => update({ cachedInputTokens: value })}
              help={<HelpTip label={t('cachedInput.label')}>{t('cachedInput.body')}</HelpTip>}
            />
            <NumberField
              id="output-tokens"
              label={tc('outputTokens')}
              value={inputs.outputTokens}
              onChange={(value) => update({ outputTokens: value })}
              help={<HelpTip label={t('outputTokens.label')}>{t('outputTokens.body')}</HelpTip>}
            />
          </div>

          <Collapsible className="mt-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" type="button">
                <Braces data-icon="inline-start" />
                {tTokens('trigger')}
                <ChevronDown data-icon="inline-end" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <TokenEstimator />
            </CollapsibleContent>
          </Collapsible>
        </Section>

        <Section
          title={tc('sectionCaching')}
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
          {isCacheAvailable ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex min-h-5 items-center gap-1">
                  <Label htmlFor="cache-hit">{tc('cacheHitRate')}</Label>
                  <HelpTip label={t('cacheHitRate.label')}>{t('cacheHitRate.body')}</HelpTip>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {inputs.promptCacheHitPercentage}%
                </span>
              </div>
              <Slider
                id="cache-hit"
                value={[inputs.promptCacheHitPercentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => update({ promptCacheHitPercentage: values[0] ?? 0 })}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tc('cacheUnavailable', { provider: result?.provider ?? '' })}
            </p>
          )}
        </Section>
      </div>

      <div className="grid content-start gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {tc('costSummary')}
          </h2>
          {isCalculating ? (
            <span className="text-xs text-muted-foreground">{tc('calculating')}</span>
          ) : null}
        </div>
        <CostSummary result={result} />
      </div>
    </div>
  );
}
