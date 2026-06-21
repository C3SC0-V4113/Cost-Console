'use client';

import { useTranslations } from 'next-intl';

import { NumberField, Section } from '@/components/calc/calculator-fields';
import { HelpTip } from '@/components/help/help-tip';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { NO_BENCHMARK_ID, overrideDefaults } from './text-to-sql-inputs';

import type { TextToSqlCalculatorInputs } from './text-to-sql-inputs';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

function clampPercent(value: number): number {
  return Math.min(100, value);
}

// Group benchmark scenarios by their dataset so the select reads as one entry
// per benchmark, with the model options nested under it.
function groupBenchmarks(benchmarks: TextToSqlBenchmarkDTO[]): [string, TextToSqlBenchmarkDTO[]][] {
  const groups = new Map<string, TextToSqlBenchmarkDTO[]>();
  for (const entry of benchmarks) {
    const list = groups.get(entry.benchmark) ?? [];
    list.push(entry);
    groups.set(entry.benchmark, list);
  }
  return [...groups];
}

// Benchmark selector (accuracy source) plus the validation/retry toggle and the
// manual override. Accuracy is always resolved here, never typed freely.
export function TextToSqlBenchmarkSection({
  benchmarks,
  inputs,
  update,
  hasBenchmark,
  isPaired,
}: Readonly<{
  benchmarks: TextToSqlBenchmarkDTO[];
  inputs: TextToSqlCalculatorInputs;
  update: (patch: Partial<TextToSqlCalculatorInputs>) => void;
  hasBenchmark: boolean;
  isPaired: boolean;
}>) {
  const t = useTranslations('help');
  const tt = useTranslations('textToSql');

  return (
    <Section
      title={tt('sectionBenchmark')}
      help={<HelpTip label={t('accuracy.label')}>{t('accuracy.body')}</HelpTip>}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="text-to-sql-benchmark">{tt('benchmarkLabel')}</Label>
        <Select
          value={inputs.benchmarkId}
          onValueChange={(value) => {
            const next = benchmarks.find((entry) => entry.id === value) ?? null;
            const isNextPaired = next?.semanticAccuracy != null;
            update({
              benchmarkId: value,
              // Retry only applies with a paired (semantic-layer) benchmark.
              includeRetry: isNextPaired ? inputs.includeRetry : false,
              ...overrideDefaults(next),
            });
          }}
        >
          <SelectTrigger id="text-to-sql-benchmark">
            <SelectValue placeholder={tt('benchmarkPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={NO_BENCHMARK_ID}>{tt('noBenchmark')}</SelectItem>
            </SelectGroup>
            {groupBenchmarks(benchmarks).map(([name, entries]) => (
              <SelectGroup key={name}>
                <SelectLabel>{name}</SelectLabel>
                {entries.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.provider} · {entry.model}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {hasBenchmark ? tt('benchmarkNote') : tt('noBenchmarkNote')}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="text-to-sql-retry"
          checked={inputs.includeRetry}
          disabled={!isPaired}
          onCheckedChange={(checked) => update({ includeRetry: checked === true })}
        />
        <Label
          htmlFor="text-to-sql-retry"
          className={!isPaired ? 'text-muted-foreground' : undefined}
        >
          {tt('includeRetry')}
        </Label>
        <HelpTip label={t('validationLoop.label')}>{t('validationLoop.body')}</HelpTip>
      </div>

      {hasBenchmark ? (
        <div className="grid gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="text-to-sql-override"
              checked={inputs.overrideAccuracy}
              onCheckedChange={(checked) => update({ overrideAccuracy: checked === true })}
            />
            <Label htmlFor="text-to-sql-override">{tt('overrideAccuracy')}</Label>
            {inputs.overrideAccuracy ? (
              <Badge variant="outline">{tt('overrideBadge')}</Badge>
            ) : null}
          </div>
          {inputs.overrideAccuracy ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="override-baseline-accuracy"
                  label={tt('overrideBaseline')}
                  value={inputs.overrideBaselineAccuracy}
                  onChange={(value) => update({ overrideBaselineAccuracy: clampPercent(value) })}
                />
                {isPaired ? (
                  <NumberField
                    id="override-semantic-accuracy"
                    label={tt('overrideSemantic')}
                    value={inputs.overrideSemanticAccuracy}
                    onChange={(value) => update({ overrideSemanticAccuracy: clampPercent(value) })}
                  />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{tt('overrideNote')}</p>
            </>
          ) : null}
        </div>
      ) : null}
    </Section>
  );
}
