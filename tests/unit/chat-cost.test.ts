import { describe, expect, it } from 'vitest';

import { computeChatCost } from '@/lib/calc/chat-cost';

import type { ChatCostInput, ChatCostPricing } from '@/lib/calc/chat-cost';

const baseInput: ChatCostInput = {
  interactionsPerDay: 10,
  daysPerMonth: 30,
  systemPromptTokens: 1000,
  userInputTokens: 500,
  historyContextTokens: 2000,
  cachedInputTokens: 3000,
  outputTokens: 300,
  promptCacheHitPercentage: 50,
};

const anthropicPricing: ChatCostPricing = {
  provider: 'Anthropic',
  model: 'claude-opus-4-5',
  currency: 'USD',
  inputPrice: '5.00',
  outputPrice: '25.00',
  cachedInputReadPrice: '0.50',
  cacheWritePrice: '6.25',
};

const openAiPricing: ChatCostPricing = {
  provider: 'OpenAI',
  model: 'gpt-5.4',
  currency: 'USD',
  inputPrice: '2.50',
  outputPrice: '15.00',
  cachedInputReadPrice: '0.25',
  cacheWritePrice: null,
};

const mistralPricing: ChatCostPricing = {
  provider: 'Mistral',
  model: 'mistral-medium-3.5',
  currency: 'USD',
  inputPrice: '1.50',
  outputPrice: '7.50',
  cachedInputReadPrice: null,
  cacheWritePrice: null,
};

function lineItem(result: ReturnType<typeof computeChatCost>, category: string) {
  return result.lineItems.find((item) => item.category === category);
}

describe('computeChatCost', () => {
  it('splits cacheable tokens into cache read and cache write for write-priced providers', () => {
    const result = computeChatCost(baseInput, anthropicPricing);

    expect(result.cacheAvailable).toBe(true);
    expect(lineItem(result, 'input')?.costPerInteraction).toBe('0.0025');
    expect(lineItem(result, 'cached_input')?.costPerInteraction).toBe('0.00075');
    expect(lineItem(result, 'cache_write')?.costPerInteraction).toBe('0.009375');
    expect(lineItem(result, 'output')?.costPerInteraction).toBe('0.0075');
    expect(result.costPerInteraction).toBe('0.020125');
  });

  it('rolls per-interaction cost up to day, month, and year', () => {
    const result = computeChatCost(baseInput, anthropicPricing);

    expect(result.dailyCost).toBe('0.20125');
    expect(result.monthlyCost).toBe('6.0375');
    expect(result.yearlyCost).toBe('72.45');
  });

  it('bills cache misses as regular input when the provider has no cache write price', () => {
    const result = computeChatCost(baseInput, openAiPricing);

    expect(result.cacheAvailable).toBe(true);
    expect(lineItem(result, 'cache_write')).toBeUndefined();
    // uncached input = 3500 total - 1500 cache reads = 2000 tokens at $2.50/1M
    expect(lineItem(result, 'input')?.costPerInteraction).toBe('0.005');
    expect(lineItem(result, 'cached_input')?.costPerInteraction).toBe('0.000375');
    expect(result.costPerInteraction).toBe('0.009875');
  });

  it('treats all input as uncached when the provider does not offer caching', () => {
    const result = computeChatCost(baseInput, mistralPricing);

    expect(result.cacheAvailable).toBe(false);
    expect(lineItem(result, 'cached_input')).toBeUndefined();
    expect(lineItem(result, 'cache_write')).toBeUndefined();
    // all 3500 input tokens at $1.50/1M
    expect(lineItem(result, 'input')?.costPerInteraction).toBe('0.00525');
    expect(result.costPerInteraction).toBe('0.0075');
  });

  it('writes nothing and reads everything at a 100% cache hit rate', () => {
    const result = computeChatCost(
      { ...baseInput, promptCacheHitPercentage: 100 },
      anthropicPricing
    );

    expect(lineItem(result, 'cache_write')).toBeUndefined();
    expect(lineItem(result, 'cached_input')?.costPerInteraction).toBe('0.0015');
    expect(result.costPerInteraction).toBe('0.0115');
  });

  it('reads nothing and writes everything at a 0% cache hit rate', () => {
    const result = computeChatCost({ ...baseInput, promptCacheHitPercentage: 0 }, anthropicPricing);

    expect(lineItem(result, 'cached_input')).toBeUndefined();
    expect(lineItem(result, 'cache_write')?.costPerInteraction).toBe('0.01875');
    expect(result.costPerInteraction).toBe('0.02875');
  });
});
