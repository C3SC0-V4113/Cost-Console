import { describe, expect, it } from 'vitest';

import { computeTextToSqlCost } from '@/lib/calc/text-to-sql-cost';

import type { TextToSqlCostInput, TextToSqlPricing } from '@/lib/calc/text-to-sql-cost';

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

describe('computeTextToSqlCost — scenarios', () => {
  it('models raw text-to-sql without semantic context or retries', () => {
    const { scenarios } = computeTextToSqlCost(input, pricing);
    const raw = scenarios.raw;

    // question 50@5 + schema 2000@5 (no cache hit) + output 120@15 = 0.01205.
    expect(Number(raw.costPerQuestion)).toBeCloseTo(0.01205, 10);
    expect(raw.accuracyPercentage).toBe(60);
    expect(raw.lineItems.map((item) => item.category)).toEqual([
      'question',
      'schema_context',
      'sql_output',
    ]);
  });

  it('adds semantic metadata cost and uses the semantic accuracy', () => {
    const { scenarios } = computeTextToSqlCost(input, pricing);
    const semantic = scenarios.semantic;

    // raw 0.01205 + semantic metadata 1500@5 = 0.0075 -> 0.01955.
    expect(Number(semantic.costPerQuestion)).toBeCloseTo(0.01955, 10);
    expect(semantic.accuracyPercentage).toBe(85);
    expect(semantic.lineItems.some((item) => item.category === 'semantic_context')).toBe(true);
  });

  it('adds the validation/retry loop priced by expected repairs', () => {
    const { scenarios } = computeTextToSqlCost(input, pricing);
    const retry = scenarios.semanticRetry;

    // expected repairs = (1 - 0.85) * 2 = 0.3; validation 300@5 = 0.0015;
    // retry 0.3 * 0.01955 = 0.005865 -> +0.007365 over semantic 0.01955 = 0.026915.
    expect(Number(retry.costPerQuestion)).toBeCloseTo(0.026915, 10);
    expect(retry.lineItems.some((item) => item.category === 'validation_retry')).toBe(true);
  });

  it('rolls the semantic+retry scenario up to monthly and yearly', () => {
    const { scenarios } = computeTextToSqlCost(input, pricing);
    const retry = scenarios.semanticRetry;

    // 0.026915 * 100 * 20 = 53.83 per month.
    expect(Number(retry.monthlyCost)).toBeCloseTo(53.83, 6);
    expect(Number(retry.yearlyCost)).toBeCloseTo(645.96, 4);
  });

  it('reports the accuracy delta between baseline and semantic', () => {
    const { accuracy } = computeTextToSqlCost(input, pricing);

    expect(accuracy).toEqual({
      baselinePercentage: 60,
      semanticPercentage: 85,
      deltaPercentage: 25,
    });
  });
});

describe('computeTextToSqlCost — caching and warehouse', () => {
  it('discounts cacheable static context at the cache hit rate', () => {
    const { scenarios } = computeTextToSqlCost({ ...input, promptCacheHitPercentage: 50 }, pricing);

    // schema 2000: 1000 read @0.5 = 0.0005 + 1000 miss @5 = 0.005 -> 0.0055
    // raw = question 0.00025 + schema 0.0055 + output 0.0018 = 0.00755.
    expect(Number(scenarios.raw.costPerQuestion)).toBeCloseTo(0.00755, 10);
  });

  it('ignores cache hit rate when the model has no cache pricing', () => {
    const { cacheAvailable: isCacheAvailable, scenarios } = computeTextToSqlCost(
      { ...input, promptCacheHitPercentage: 90 },
      { ...pricing, generation: { ...pricing.generation, cachedInputReadPrice: null } }
    );

    expect(isCacheAvailable).toBe(false);
    // No discount: same as the uncached raw scenario (0.01205).
    expect(Number(scenarios.raw.costPerQuestion)).toBeCloseTo(0.01205, 10);
  });

  it('adds warehouse execution cost when a source-backed price exists', () => {
    const { scenarios } = computeTextToSqlCost(input, {
      ...pricing,
      warehousePricePerThousandQueries: '2.0',
    });

    // 2.0 / 1000 = 0.002 per question on top of raw 0.01205 = 0.01405.
    expect(scenarios.raw.warehouse).toEqual({
      available: true,
      costPerQuestion: '0.002',
      monthlyCost: '4',
    });
    expect(Number(scenarios.raw.costPerQuestion)).toBeCloseTo(0.01405, 10);
  });

  it('marks warehouse unavailable when no price exists', () => {
    const { scenarios } = computeTextToSqlCost(input, pricing);

    expect(scenarios.raw.warehouse).toEqual({ available: false });
  });
});
