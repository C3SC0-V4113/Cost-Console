import Decimal from 'decimal.js';

// Backend-owned chat cost math. Pure and React-free so the UI never duplicates
// pricing logic (README product boundary). Prices are decimal strings per 1M
// tokens; results are returned as decimal strings to stay serialization-safe.

const TOKENS_PER_PRICE_UNIT = new Decimal(1_000_000);
const MONTHS_PER_YEAR = 12;

export type ChatCostPricing = {
  provider: string;
  model: string;
  currency: string;
  inputPrice: string;
  outputPrice: string;
  cachedInputReadPrice: string | null;
  cacheWritePrice: string | null;
};

export type ChatCostInput = {
  interactionsPerDay: number;
  daysPerMonth: number;
  systemPromptTokens: number;
  userInputTokens: number;
  historyContextTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  promptCacheHitPercentage: number;
};

export type ChatCostCategory = 'input' | 'cached_input' | 'cache_write' | 'output';

export type ChatCostLineItem = {
  category: ChatCostCategory;
  label: string;
  tokensPerInteraction: string;
  unitPrice: string;
  costPerInteraction: string;
};

export type ChatCostResult = {
  provider: string;
  model: string;
  currency: string;
  cacheAvailable: boolean;
  lineItems: ChatCostLineItem[];
  costPerInteraction: string;
  dailyCost: string;
  monthlyCost: string;
  yearlyCost: string;
  assumptions: {
    interactionsPerDay: number;
    daysPerMonth: number;
    promptCacheHitPercentage: number;
    provider: string;
    model: string;
    currency: string;
  };
};

function clampPercentage(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}

function tokenCost(tokens: Decimal, pricePerMillion: string): Decimal {
  return tokens.mul(pricePerMillion).div(TOKENS_PER_PRICE_UNIT);
}

function makeLineItem(
  category: ChatCostCategory,
  label: string,
  tokens: Decimal,
  unitPrice: string
): ChatCostLineItem {
  return {
    category,
    label,
    tokensPerInteraction: tokens.toString(),
    unitPrice,
    costPerInteraction: tokenCost(tokens, unitPrice).toString(),
  };
}

export function computeChatCost(input: ChatCostInput, pricing: ChatCostPricing): ChatCostResult {
  const hitRate = new Decimal(clampPercentage(input.promptCacheHitPercentage)).div(100);
  const totalInputTokens = new Decimal(input.systemPromptTokens)
    .add(input.userInputTokens)
    .add(input.historyContextTokens);
  const cacheableTokens = Decimal.min(new Decimal(input.cachedInputTokens), totalInputTokens);
  const isCacheAvailable = pricing.cachedInputReadPrice !== null;

  let readTokens = new Decimal(0);
  let writeTokens = new Decimal(0);
  let uncachedInputTokens = totalInputTokens;

  if (isCacheAvailable) {
    readTokens = cacheableTokens.mul(hitRate);
    const missTokens = cacheableTokens.sub(readTokens);

    if (pricing.cacheWritePrice !== null) {
      // Provider charges to establish the cache: misses are written, not re-billed as input.
      writeTokens = missTokens;
      uncachedInputTokens = totalInputTokens.sub(cacheableTokens);
    } else {
      // No write charge: cache misses fall back to the regular input rate.
      uncachedInputTokens = totalInputTokens.sub(readTokens);
    }
  }

  const lineItems: ChatCostLineItem[] = [
    makeLineItem('input', 'Uncached input', uncachedInputTokens, pricing.inputPrice),
  ];

  if (isCacheAvailable && pricing.cachedInputReadPrice !== null && readTokens.gt(0)) {
    lineItems.push(
      makeLineItem('cached_input', 'Cached input (read)', readTokens, pricing.cachedInputReadPrice)
    );
  }

  if (pricing.cacheWritePrice !== null && writeTokens.gt(0)) {
    lineItems.push(
      makeLineItem('cache_write', 'Cache write', writeTokens, pricing.cacheWritePrice)
    );
  }

  lineItems.push(
    makeLineItem('output', 'Output', new Decimal(input.outputTokens), pricing.outputPrice)
  );

  const perInteraction = lineItems.reduce(
    (sum, item) => sum.add(item.costPerInteraction),
    new Decimal(0)
  );
  const daily = perInteraction.mul(input.interactionsPerDay);
  const monthly = daily.mul(input.daysPerMonth);
  const yearly = monthly.mul(MONTHS_PER_YEAR);

  return {
    provider: pricing.provider,
    model: pricing.model,
    currency: pricing.currency,
    cacheAvailable: isCacheAvailable,
    lineItems,
    costPerInteraction: perInteraction.toString(),
    dailyCost: daily.toString(),
    monthlyCost: monthly.toString(),
    yearlyCost: yearly.toString(),
    assumptions: {
      interactionsPerDay: input.interactionsPerDay,
      daysPerMonth: input.daysPerMonth,
      promptCacheHitPercentage: input.promptCacheHitPercentage,
      provider: pricing.provider,
      model: pricing.model,
      currency: pricing.currency,
    },
  };
}
