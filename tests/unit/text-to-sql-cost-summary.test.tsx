import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { TextToSqlCostSummary } from '@/components/text-to-sql/text-to-sql-cost-summary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { computeTextToSqlCost } from '@/lib/calc/text-to-sql-cost';
import esMessages from '@/messages/es.json';

import type { TextToSqlCostInput, TextToSqlPricing } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

const pricing: TextToSqlPricing = {
  currency: 'USD',
  generation: {
    provider: 'OpenAI',
    model: 'gpt-5.5',
    inputPrice: '5',
    outputPrice: '15',
    cachedInputReadPrice: '0.5',
  },
  warehousePricePerThousandQueries: null,
};

const input: TextToSqlCostInput = {
  questionsPerDay: 100,
  daysPerMonth: 20,
  questionTokens: 50,
  schemaContextTokens: 2000,
  semanticMetadataTokens: 1500,
  sqlOutputTokens: 120,
  validationPromptTokens: 300,
  maxRepairAttempts: 2,
  baselineAccuracyPercentage: 60,
  semanticAccuracyPercentage: 85,
  promptCacheHitPercentage: 0,
};

const benchmark: TextToSqlBenchmarkDTO = {
  id: 'dbt Semantic Layer · ACME Insurance::OpenAI::gpt-5.3-codex',
  benchmark: 'dbt Semantic Layer · ACME Insurance',
  provider: 'OpenAI',
  model: 'gpt-5.3-codex',
  metricType: 'execution_accuracy',
  isOfficial: true,
  baselineAccuracy: '60',
  semanticAccuracy: '85',
  notes: null,
  source: {
    title: 'dbt Semantic Layer benchmark',
    url: 'https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026',
    sourceType: 'vendor_benchmark',
    sourceDate: '2026-04-07',
    retrievedAt: '2026-06-19T00:00:00.000Z',
  },
};

function renderSummary() {
  render(
    <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
      <TooltipProvider>
        <TextToSqlCostSummary result={computeTextToSqlCost(input, pricing)} benchmark={benchmark} />
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe('TextToSqlCostSummary', () => {
  it('compares the three scenarios with their monthly cost', () => {
    renderSummary();

    expect(screen.getByText('Text-to-SQL crudo')).toBeTruthy();
    expect(screen.getByText('Con capa semántica')).toBeTruthy();
    expect(screen.getByText('Semántica + validación/reintento')).toBeTruthy();
    // semantic+retry monthly = 0.026915 * 100 * 20 = 53.83 -> "53,83 US$".
    expect(screen.getByText(/53,83\sUS\$/u)).toBeTruthy();
  });

  it('shows accuracy as a cited benchmark result, not an input', () => {
    renderSummary();

    expect(screen.getByText('+25%')).toBeTruthy();
    expect(
      screen.getByText('dbt Semantic Layer · ACME Insurance · OpenAI gpt-5.3-codex')
    ).toBeTruthy();
    expect(screen.getByText('Benchmark oficial')).toBeTruthy();
  });

  it('breaks down the validation/retry line item and warehouse state', () => {
    renderSummary();

    expect(screen.getByText('Validación / reintento')).toBeTruthy();
    expect(screen.getByText('No disponible (sin precio citado)')).toBeTruthy();
  });

  it('renders a placeholder when there is no result', () => {
    render(
      <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
        <TextToSqlCostSummary result={null} benchmark={null} />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByText('Elegí un modelo y un benchmark para estimar el costo de Text-to-SQL.')
    ).toBeTruthy();
  });
});
