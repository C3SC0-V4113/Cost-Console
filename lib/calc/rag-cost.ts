import Decimal from 'decimal.js';

import { computeChatCost } from './chat-cost';

import type { ChatCostResult } from './chat-cost';

// Backend-owned RAG cost math. Pure and React-free so the UI never duplicates
// pricing logic (README product boundary). Separates one-time ingestion from
// recurring per-query cost (docs/product/views.md). The generation step is a
// chat call, so it reuses computeChatCost rather than re-deriving cache-aware
// LLM math. Prices are decimal strings per 1M tokens; results are decimal
// strings to stay serialization-safe across the server/client boundary.

const TOKENS_PER_PRICE_UNIT = new Decimal(1_000_000);
const MONTHS_PER_YEAR = 12;

export type RagEmbeddingPricing = {
  provider: string;
  model: string;
  embeddingPrice: string;
};

export type RagGenerationPricing = {
  provider: string;
  model: string;
  inputPrice: string;
  outputPrice: string;
  cachedInputReadPrice: string | null;
  cacheWritePrice: string | null;
};

export type RagCostPricing = {
  currency: string;
  ingestionEmbedding: RagEmbeddingPricing;
  queryEmbedding: RagEmbeddingPricing;
  generation: RagGenerationPricing;
  // Optional and source-backed: cost per 1M stored vectors per month. Null when
  // no cited storage price exists — the lab still estimates token cost without
  // inventing storage pricing (views.md).
  storagePricePerMillionVectorsPerMonth: string | null;
};

export type RagCostInput = {
  // Ingestion (one-time).
  documentCount: number;
  avgDocumentTokens: number;
  cleanupRetentionPercentage: number;
  chunkSize: number;
  chunkOverlap: number;
  // Query workload (recurring).
  queriesPerDay: number;
  daysPerMonth: number;
  avgQueryTokens: number;
  topK: number;
  avgRetrievedChunkTokens: number;
  // Generation.
  systemPromptTokens: number;
  expectedOutputTokens: number;
  promptCacheHitPercentage: number;
};

export type RagStorageSummary = { available: false } | { available: true; monthlyCost: string };

export type RagCostResult = {
  currency: string;
  ingestion: {
    provider: string;
    model: string;
    effectiveCorpusTokens: string;
    expectedChunks: string;
    totalEmbeddingTokens: string;
    cost: string;
  };
  query: {
    embeddingProvider: string;
    embeddingModel: string;
    queryEmbeddingTokens: string;
    queryEmbeddingCost: string;
    retrievedContextTokens: string;
    generation: ChatCostResult;
    costPerQuery: string;
  };
  dailyQueryCost: string;
  monthlyQueryCost: string;
  yearlyQueryCost: string;
  storage: RagStorageSummary;
  monthlyTotal: string;
  yearlyTotal: string;
  cacheAvailable: boolean;
  assumptions: {
    queriesPerDay: number;
    daysPerMonth: number;
    topK: number;
    promptCacheHitPercentage: number;
    currency: string;
    ingestionModel: string;
    queryEmbeddingModel: string;
    generationModel: string;
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

export function computeRagCost(input: RagCostInput, pricing: RagCostPricing): RagCostResult {
  // --- One-time ingestion ---
  const retention = new Decimal(clampPercentage(input.cleanupRetentionPercentage)).div(100);
  const effectiveCorpusTokens = new Decimal(input.documentCount)
    .mul(input.avgDocumentTokens)
    .mul(retention);

  // Overlap re-embeds tokens, so each new chunk advances by (chunkSize - overlap).
  const chunkStride = Decimal.max(new Decimal(input.chunkSize).sub(input.chunkOverlap), 1);
  const expectedChunks = effectiveCorpusTokens.gt(0)
    ? effectiveCorpusTokens.div(chunkStride).ceil()
    : new Decimal(0);
  const totalEmbeddingTokens = expectedChunks.mul(input.chunkSize);
  const ingestionCost = tokenCost(totalEmbeddingTokens, pricing.ingestionEmbedding.embeddingPrice);

  // --- Per-query embedding ---
  const queryEmbeddingTokens = new Decimal(input.avgQueryTokens);
  const queryEmbeddingCost = tokenCost(queryEmbeddingTokens, pricing.queryEmbedding.embeddingPrice);

  // Retrieved chunks become part of the final LLM context (not query embedding).
  const retrievedContextTokens = new Decimal(input.topK).mul(input.avgRetrievedChunkTokens);

  // --- Generation (a chat call: system + question + retrieved context + output) ---
  const generation = computeChatCost(
    {
      interactionsPerDay: 1,
      daysPerMonth: 1,
      systemPromptTokens: input.systemPromptTokens,
      userInputTokens: input.avgQueryTokens,
      historyContextTokens: retrievedContextTokens.toNumber(),
      // The static system prompt is the cacheable portion across queries.
      cachedInputTokens: input.systemPromptTokens,
      outputTokens: input.expectedOutputTokens,
      promptCacheHitPercentage: input.promptCacheHitPercentage,
    },
    {
      provider: pricing.generation.provider,
      model: pricing.generation.model,
      currency: pricing.currency,
      inputPrice: pricing.generation.inputPrice,
      outputPrice: pricing.generation.outputPrice,
      cachedInputReadPrice: pricing.generation.cachedInputReadPrice,
      cacheWritePrice: pricing.generation.cacheWritePrice,
    }
  );

  const costPerQuery = queryEmbeddingCost.add(generation.costPerInteraction);
  const dailyQueryCost = costPerQuery.mul(input.queriesPerDay);
  const monthlyQueryCost = dailyQueryCost.mul(input.daysPerMonth);
  const yearlyQueryCost = monthlyQueryCost.mul(MONTHS_PER_YEAR);

  // --- Optional storage ---
  let storage: RagStorageSummary = { available: false };
  if (pricing.storagePricePerMillionVectorsPerMonth !== null) {
    const monthlyStorageCost = expectedChunks
      .mul(pricing.storagePricePerMillionVectorsPerMonth)
      .div(TOKENS_PER_PRICE_UNIT);
    storage = { available: true, monthlyCost: monthlyStorageCost.toString() };
  }

  const storageMonthly = storage.available ? new Decimal(storage.monthlyCost) : new Decimal(0);
  const monthlyTotal = monthlyQueryCost.add(storageMonthly);
  const yearlyTotal = yearlyQueryCost.add(storageMonthly.mul(MONTHS_PER_YEAR));

  return {
    currency: pricing.currency,
    ingestion: {
      provider: pricing.ingestionEmbedding.provider,
      model: pricing.ingestionEmbedding.model,
      effectiveCorpusTokens: effectiveCorpusTokens.toString(),
      expectedChunks: expectedChunks.toString(),
      totalEmbeddingTokens: totalEmbeddingTokens.toString(),
      cost: ingestionCost.toString(),
    },
    query: {
      embeddingProvider: pricing.queryEmbedding.provider,
      embeddingModel: pricing.queryEmbedding.model,
      queryEmbeddingTokens: queryEmbeddingTokens.toString(),
      queryEmbeddingCost: queryEmbeddingCost.toString(),
      retrievedContextTokens: retrievedContextTokens.toString(),
      generation,
      costPerQuery: costPerQuery.toString(),
    },
    dailyQueryCost: dailyQueryCost.toString(),
    monthlyQueryCost: monthlyQueryCost.toString(),
    yearlyQueryCost: yearlyQueryCost.toString(),
    storage,
    monthlyTotal: monthlyTotal.toString(),
    yearlyTotal: yearlyTotal.toString(),
    cacheAvailable: generation.cacheAvailable,
    assumptions: {
      queriesPerDay: input.queriesPerDay,
      daysPerMonth: input.daysPerMonth,
      topK: input.topK,
      promptCacheHitPercentage: input.promptCacheHitPercentage,
      currency: pricing.currency,
      ingestionModel: pricing.ingestionEmbedding.model,
      queryEmbeddingModel: pricing.queryEmbedding.model,
      generationModel: pricing.generation.model,
    },
  };
}
