import { describe, expect, it } from 'vitest';

import { computeRagCost } from '@/lib/calc/rag-cost';

import type { RagCostInput, RagCostPricing } from '@/lib/calc/rag-cost';

const pricing: RagCostPricing = {
  currency: 'USD',
  ingestionEmbedding: {
    provider: 'OpenAI',
    model: 'text-embedding-3-small',
    embeddingPrice: '0.02',
  },
  queryEmbedding: { provider: 'OpenAI', model: 'text-embedding-3-small', embeddingPrice: '0.02' },
  generation: {
    provider: 'OpenAI',
    model: 'gpt-5.5',
    inputPrice: '5',
    outputPrice: '15',
    cachedInputReadPrice: '0.5',
    cacheWritePrice: null,
  },
  storagePricePerMillionVectorsPerMonth: null,
};

const input: RagCostInput = {
  documentCount: 100,
  avgDocumentTokens: 1000,
  cleanupRetentionPercentage: 100,
  chunkSize: 500,
  chunkOverlap: 100,
  queriesPerDay: 50,
  daysPerMonth: 30,
  avgQueryTokens: 50,
  topK: 5,
  avgRetrievedChunkTokens: 400,
  systemPromptTokens: 300,
  expectedOutputTokens: 250,
  promptCacheHitPercentage: 0,
};

describe('computeRagCost — ingestion', () => {
  it('derives chunks from the chunk stride and bills total embedding tokens', () => {
    const result = computeRagCost(input, pricing);

    // 100 docs * 1000 tokens * 100% retention = 100000 effective tokens.
    expect(result.ingestion.effectiveCorpusTokens).toBe('100000');
    // stride = 500 - 100 = 400 -> ceil(100000 / 400) = 250 chunks.
    expect(result.ingestion.expectedChunks).toBe('250');
    // 250 chunks * 500 tokens (overlap re-embedded) = 125000 embedding tokens.
    expect(result.ingestion.totalEmbeddingTokens).toBe('125000');
    // 125000 * 0.02 / 1e6 = 0.0025.
    expect(Number(result.ingestion.cost)).toBeCloseTo(0.0025, 10);
  });

  it('applies cleanup retention to the corpus', () => {
    const result = computeRagCost({ ...input, cleanupRetentionPercentage: 80 }, pricing);

    expect(result.ingestion.effectiveCorpusTokens).toBe('80000');
    expect(result.ingestion.expectedChunks).toBe('200');
    expect(Number(result.ingestion.cost)).toBeCloseTo(0.002, 10);
  });

  it('yields zero ingestion for an empty corpus', () => {
    const result = computeRagCost({ ...input, documentCount: 0 }, pricing);

    expect(result.ingestion.expectedChunks).toBe('0');
    expect(Number(result.ingestion.cost)).toBe(0);
  });

  it('never divides by a non-positive stride when overlap >= chunk size', () => {
    const result = computeRagCost({ ...input, chunkSize: 200, chunkOverlap: 300 }, pricing);

    // stride clamps to 1 -> ceil(100000 / 1) = 100000 chunks.
    expect(result.ingestion.expectedChunks).toBe('100000');
    expect(Number.isFinite(Number(result.ingestion.cost))).toBe(true);
  });
});

describe('computeRagCost — per-query', () => {
  it('separates query embedding from retrieved-context generation', () => {
    const result = computeRagCost(input, pricing);

    // query embedding: 50 tokens * 0.02 / 1e6 = 0.000001.
    expect(Number(result.query.queryEmbeddingCost)).toBeCloseTo(0.000001, 12);
    // retrieved context = top-k(5) * 400 = 2000 tokens, fed to the LLM, not embedded.
    expect(result.query.retrievedContextTokens).toBe('2000');
  });

  it('reuses the chat engine for cache-aware generation', () => {
    const result = computeRagCost(input, pricing);

    // generation input = system(300) + question(50) + context(2000) = 2350 @ 5/1M = 0.01175;
    // output 250 @ 15/1M = 0.00375 -> 0.0155 per query generation.
    expect(Number(result.query.generation.costPerInteraction)).toBeCloseTo(0.0155, 10);
    expect(result.cacheAvailable).toBe(true);
    // per query = query embedding + generation.
    expect(Number(result.query.costPerQuery)).toBeCloseTo(0.015501, 10);
  });

  it('rolls per-query cost up to daily, monthly, and yearly', () => {
    const result = computeRagCost(input, pricing);

    expect(Number(result.dailyQueryCost)).toBeCloseTo(0.77505, 8);
    expect(Number(result.monthlyQueryCost)).toBeCloseTo(23.2515, 6);
    expect(Number(result.yearlyQueryCost)).toBeCloseTo(279.018, 4);
  });
});

describe('computeRagCost — storage', () => {
  it('reports storage unavailable when no source-backed price exists', () => {
    const result = computeRagCost(input, pricing);

    expect(result.storage).toEqual({ available: false });
    expect(Number(result.monthlyTotal)).toBeCloseTo(Number(result.monthlyQueryCost), 10);
  });

  it('adds monthly storage when a price is provided', () => {
    const result = computeRagCost(input, {
      ...pricing,
      storagePricePerMillionVectorsPerMonth: '0.5',
    });

    // 250 chunks * 0.5 / 1e6 = 0.000125 per month.
    expect(result.storage).toEqual({ available: true, monthlyCost: '0.000125' });
    expect(Number(result.monthlyTotal)).toBeCloseTo(Number(result.monthlyQueryCost) + 0.000125, 10);
    expect(Number(result.yearlyTotal)).toBeCloseTo(Number(result.yearlyQueryCost) + 0.0015, 10);
  });
});
