import { describe, expect, it } from 'vitest';

import { computeTextToSqlCost } from '@/lib/calc/text-to-sql-cost';

import type {
  TextToSqlCostInput,
  TextToSqlCostResult,
  TextToSqlPricing,
  TextToSqlScenarioKey,
} from '@/lib/calc/text-to-sql-cost';

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
  promptCacheHitPercentage: 0,
  includeSemantic: true,
  includeRetry: true,
  baselineAccuracyPercentage: 60,
  semanticAccuracyPercentage: 85,
};

function scenario(result: TextToSqlCostResult, key: TextToSqlScenarioKey) {
  return result.scenarios.find((s) => s.key === key);
}

describe('computeTextToSqlCost — scenarios', () => {
  it('models raw text-to-sql without semantic context or retries', () => {
    const raw = scenario(computeTextToSqlCost(input, pricing), 'raw');

    // question 50@5 + schema 2000@5 (no cache hit) + output 120@15 = 0.01205.
    expect(Number(raw?.costPerQuestion)).toBeCloseTo(0.01205, 10);
    expect(raw?.accuracyPercentage).toBe(60);
    expect(raw?.lineItems.map((item) => item.category)).toEqual([
      'question',
      'schema_context',
      'sql_output',
    ]);
  });

  it('adds semantic metadata cost and uses the semantic accuracy', () => {
    const semantic = scenario(computeTextToSqlCost(input, pricing), 'semantic');

    // raw 0.01205 + semantic metadata 1500@5 = 0.0075 -> 0.01955.
    expect(Number(semantic?.costPerQuestion)).toBeCloseTo(0.01955, 10);
    expect(semantic?.accuracyPercentage).toBe(85);
    expect(semantic?.lineItems.some((item) => item.category === 'semantic_context')).toBe(true);
  });

  it('adds the validation/retry loop priced by expected repairs', () => {
    const retry = scenario(computeTextToSqlCost(input, pricing), 'semanticRetry');

    // expected repairs = (1 - 0.85) * 2 = 0.3; validation 300@5 = 0.0015;
    // retry 0.3 * 0.01955 = 0.005865 -> +0.007365 over semantic 0.01955 = 0.026915.
    expect(Number(retry?.costPerQuestion)).toBeCloseTo(0.026915, 10);
    expect(retry?.lineItems.some((item) => item.category === 'validation_retry')).toBe(true);
    // 0.026915 * 100 * 20 = 53.83 per month.
    expect(Number(retry?.monthlyCost)).toBeCloseTo(53.83, 6);
  });

  it('reports the accuracy delta between baseline and semantic', () => {
    expect(computeTextToSqlCost(input, pricing).accuracy).toEqual({
      baselinePercentage: 60,
      semanticPercentage: 85,
      deltaPercentage: 25,
    });
  });
});

describe('computeTextToSqlCost — conditional scenarios', () => {
  it('shows only the raw scenario and no accuracy without a benchmark', () => {
    const result = computeTextToSqlCost(
      {
        ...input,
        includeSemantic: false,
        includeRetry: false,
        baselineAccuracyPercentage: null,
        semanticAccuracyPercentage: null,
      },
      pricing
    );

    expect(result.scenarios.map((s) => s.key)).toEqual(['raw']);
    expect(result.accuracy).toBeNull();
    expect(scenario(result, 'raw')?.accuracyPercentage).toBeNull();
    // Cost is still modeled.
    expect(Number(scenario(result, 'raw')?.costPerQuestion)).toBeCloseTo(0.01205, 10);
  });

  it('omits the retry scenario when the retry loop is not selected', () => {
    const result = computeTextToSqlCost({ ...input, includeRetry: false }, pricing);

    expect(result.scenarios.map((s) => s.key)).toEqual(['raw', 'semantic']);
    expect(result.accuracy).not.toBeNull();
  });

  it('shows baseline-only accuracy for a raw-only benchmark', () => {
    const result = computeTextToSqlCost(
      { ...input, includeSemantic: false, includeRetry: false, semanticAccuracyPercentage: null },
      pricing
    );

    expect(result.scenarios.map((s) => s.key)).toEqual(['raw']);
    expect(result.accuracy).toEqual({
      baselinePercentage: 60,
      semanticPercentage: null,
      deltaPercentage: null,
    });
    expect(scenario(result, 'raw')?.accuracyPercentage).toBe(60);
  });
});

describe('computeTextToSqlCost — caching and warehouse', () => {
  it('discounts cacheable static context at the cache hit rate', () => {
    const raw = scenario(
      computeTextToSqlCost({ ...input, promptCacheHitPercentage: 50 }, pricing),
      'raw'
    );

    // schema 2000: 1000 read @0.5 = 0.0005 + 1000 miss @5 = 0.005 -> 0.0055
    // raw = question 0.00025 + schema 0.0055 + output 0.0018 = 0.00755.
    expect(Number(raw?.costPerQuestion)).toBeCloseTo(0.00755, 10);
  });

  it('ignores cache hit rate when the model has no cache pricing', () => {
    const result = computeTextToSqlCost(
      { ...input, promptCacheHitPercentage: 90 },
      { ...pricing, generation: { ...pricing.generation, cachedInputReadPrice: null } }
    );

    expect(result.cacheAvailable).toBe(false);
    // No discount: same as the uncached raw scenario (0.01205).
    expect(Number(scenario(result, 'raw')?.costPerQuestion)).toBeCloseTo(0.01205, 10);
  });

  it('adds warehouse execution cost when a source-backed price exists', () => {
    const raw = scenario(
      computeTextToSqlCost(input, { ...pricing, warehousePricePerThousandQueries: '2.0' }),
      'raw'
    );

    // 2.0 / 1000 = 0.002 per question on top of raw 0.01205 = 0.01405.
    expect(raw?.warehouse).toEqual({
      available: true,
      costPerQuestion: '0.002',
      monthlyCost: '4',
    });
    expect(Number(raw?.costPerQuestion)).toBeCloseTo(0.01405, 10);
  });

  it('marks warehouse unavailable when no price exists', () => {
    expect(scenario(computeTextToSqlCost(input, pricing), 'raw')?.warehouse).toEqual({
      available: false,
    });
  });
});
