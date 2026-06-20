import Decimal from 'decimal.js';

// Backend-owned Text-to-SQL cost math. Pure and React-free so the UI never
// duplicates pricing logic (README product boundary). Models the doc's three-way
// comparison (docs/product/views.md): raw, with a semantic layer, and with a
// semantic layer plus a validation/retry loop. Static context (schema and
// semantic metadata) is treated as cacheable; the rest is billed as regular
// input. Prices are decimal strings per 1M tokens; results are decimal strings
// to stay serialization-safe.

const TOKENS_PER_PRICE_UNIT = new Decimal(1_000_000);
const MONTHS_PER_YEAR = 12;
const QUERIES_PER_PRICE_UNIT = new Decimal(1000);

export type TextToSqlGenerationPricing = {
  provider: string;
  model: string;
  inputPrice: string;
  outputPrice: string;
  cachedInputReadPrice: string | null;
};

export type TextToSqlPricing = {
  currency: string;
  generation: TextToSqlGenerationPricing;
  // Optional and source-backed: warehouse execution cost per 1000 queries. Null
  // when no cited value exists — the lab still estimates LLM cost and labels
  // execution cost unavailable rather than inventing it (views.md).
  warehousePricePerThousandQueries: string | null;
};

export type TextToSqlCostInput = {
  questionsPerDay: number;
  daysPerMonth: number;
  questionTokens: number;
  schemaContextTokens: number;
  semanticMetadataTokens: number;
  sqlOutputTokens: number;
  validationPromptTokens: number;
  maxRepairAttempts: number;
  baselineAccuracyPercentage: number;
  semanticAccuracyPercentage: number;
  promptCacheHitPercentage: number;
};

export type TextToSqlScenarioKey = 'raw' | 'semantic' | 'semanticRetry';

export type TextToSqlLineItemCategory =
  | 'question'
  | 'schema_context'
  | 'semantic_context'
  | 'sql_output'
  | 'validation_retry';

export type TextToSqlLineItem = {
  category: TextToSqlLineItemCategory;
  tokens: string;
  cost: string;
};

export type TextToSqlScenario = {
  key: TextToSqlScenarioKey;
  lineItems: TextToSqlLineItem[];
  accuracyPercentage: number;
  costPerQuestion: string;
  dailyCost: string;
  monthlyCost: string;
  yearlyCost: string;
  warehouse:
    | { available: false }
    | { available: true; costPerQuestion: string; monthlyCost: string };
};

export type TextToSqlCostResult = {
  currency: string;
  cacheAvailable: boolean;
  scenarios: Record<TextToSqlScenarioKey, TextToSqlScenario>;
  accuracy: {
    baselinePercentage: number;
    semanticPercentage: number;
    deltaPercentage: number;
  };
  assumptions: {
    provider: string;
    model: string;
    currency: string;
    questionsPerDay: number;
    daysPerMonth: number;
    maxRepairAttempts: number;
    promptCacheHitPercentage: number;
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

export function computeTextToSqlCost(
  input: TextToSqlCostInput,
  pricing: TextToSqlPricing
): TextToSqlCostResult {
  const isCacheAvailable = pricing.generation.cachedInputReadPrice !== null;
  const hitRate = new Decimal(clampPercentage(input.promptCacheHitPercentage)).div(100);

  // Cost of an input bucket. Static context (schema, semantic metadata) can be
  // served from cache at the cached-read rate for the hit fraction; everything
  // else is billed at the regular input rate.
  const inputBucketCost = (tokenCount: number, cacheable: boolean): Decimal => {
    const tokens = new Decimal(tokenCount);
    if (!cacheable || !isCacheAvailable || pricing.generation.cachedInputReadPrice === null) {
      return tokenCost(tokens, pricing.generation.inputPrice);
    }
    const read = tokens.mul(hitRate);
    const miss = tokens.sub(read);
    return tokenCost(read, pricing.generation.cachedInputReadPrice).add(
      tokenCost(miss, pricing.generation.inputPrice)
    );
  };

  const questionsPerMonth = new Decimal(input.questionsPerDay).mul(input.daysPerMonth);

  const warehousePerQuestion =
    pricing.warehousePricePerThousandQueries !== null
      ? new Decimal(pricing.warehousePricePerThousandQueries).div(QUERIES_PER_PRICE_UNIT)
      : null;

  const buildScenario = (
    key: TextToSqlScenarioKey,
    options: Readonly<{ semantic: boolean; retry: boolean; accuracyPercentage: number }>
  ): TextToSqlScenario => {
    const semanticTokens = options.semantic ? input.semanticMetadataTokens : 0;

    const questionCost = inputBucketCost(input.questionTokens, false);
    const schemaCost = inputBucketCost(input.schemaContextTokens, true);
    const semanticCost = inputBucketCost(semanticTokens, true);
    const sqlOutputCost = tokenCost(
      new Decimal(input.sqlOutputTokens),
      pricing.generation.outputPrice
    );

    const generationCost = questionCost.add(schemaCost).add(semanticCost).add(sqlOutputCost);

    const lineItems: TextToSqlLineItem[] = [
      { category: 'question', tokens: String(input.questionTokens), cost: questionCost.toString() },
      {
        category: 'schema_context',
        tokens: String(input.schemaContextTokens),
        cost: schemaCost.toString(),
      },
    ];
    if (options.semantic) {
      lineItems.push({
        category: 'semantic_context',
        tokens: String(semanticTokens),
        cost: semanticCost.toString(),
      });
    }
    lineItems.push({
      category: 'sql_output',
      tokens: String(input.sqlOutputTokens),
      cost: sqlOutputCost.toString(),
    });

    let perQuestion = generationCost;

    if (options.retry) {
      // Lower accuracy means more expected repair passes; each repair re-runs
      // generation, and every question pays one validation pass.
      const failureRate = new Decimal(100 - clampPercentage(options.accuracyPercentage)).div(100);
      const expectedRepairs = failureRate.mul(input.maxRepairAttempts);
      const validationCost = inputBucketCost(input.validationPromptTokens, false);
      const retryCost = expectedRepairs.mul(generationCost);
      const validationRetryCost = validationCost.add(retryCost);

      const perQuestionRegenTokens = new Decimal(input.questionTokens)
        .add(input.schemaContextTokens)
        .add(semanticTokens)
        .add(input.sqlOutputTokens);
      const validationRetryTokens = new Decimal(input.validationPromptTokens).add(
        expectedRepairs.mul(perQuestionRegenTokens)
      );

      lineItems.push({
        category: 'validation_retry',
        tokens: validationRetryTokens.toString(),
        cost: validationRetryCost.toString(),
      });
      perQuestion = perQuestion.add(validationRetryCost);
    }

    let warehouse: TextToSqlScenario['warehouse'] = { available: false };
    if (warehousePerQuestion !== null) {
      perQuestion = perQuestion.add(warehousePerQuestion);
      warehouse = {
        available: true,
        costPerQuestion: warehousePerQuestion.toString(),
        monthlyCost: warehousePerQuestion.mul(questionsPerMonth).toString(),
      };
    }

    const daily = perQuestion.mul(input.questionsPerDay);
    const monthly = daily.mul(input.daysPerMonth);
    const yearly = monthly.mul(MONTHS_PER_YEAR);

    return {
      key,
      lineItems,
      accuracyPercentage: options.accuracyPercentage,
      costPerQuestion: perQuestion.toString(),
      dailyCost: daily.toString(),
      monthlyCost: monthly.toString(),
      yearlyCost: yearly.toString(),
      warehouse,
    };
  };

  const scenarios: Record<TextToSqlScenarioKey, TextToSqlScenario> = {
    raw: buildScenario('raw', {
      semantic: false,
      retry: false,
      accuracyPercentage: input.baselineAccuracyPercentage,
    }),
    semantic: buildScenario('semantic', {
      semantic: true,
      retry: false,
      accuracyPercentage: input.semanticAccuracyPercentage,
    }),
    semanticRetry: buildScenario('semanticRetry', {
      semantic: true,
      retry: true,
      accuracyPercentage: input.semanticAccuracyPercentage,
    }),
  };

  return {
    currency: pricing.currency,
    cacheAvailable: isCacheAvailable,
    scenarios,
    accuracy: {
      baselinePercentage: input.baselineAccuracyPercentage,
      semanticPercentage: input.semanticAccuracyPercentage,
      // Round to the benchmark's 4-decimal scale so float subtraction does not
      // leak noise like 8.200000000000003 into the UI.
      deltaPercentage:
        Math.round((input.semanticAccuracyPercentage - input.baselineAccuracyPercentage) * 1e4) /
        1e4,
    },
    assumptions: {
      provider: pricing.generation.provider,
      model: pricing.generation.model,
      currency: pricing.currency,
      questionsPerDay: input.questionsPerDay,
      daysPerMonth: input.daysPerMonth,
      maxRepairAttempts: input.maxRepairAttempts,
      promptCacheHitPercentage: input.promptCacheHitPercentage,
    },
  };
}
