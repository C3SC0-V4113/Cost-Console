import { describe, expect, it } from 'vitest';

import {
  CACHING_PROVIDERS,
  citedSources,
  pricingCatalog,
  pricingSnapshot,
  ragRetrievalBenchmarks,
  textToSqlBenchmarks,
} from '../../prisma/seed-data';

const sourcesByKey = new Map(citedSources.map((source) => [source.key, source]));

describe('cited pricing seed data', () => {
  it('exposes exactly one active snapshot', () => {
    expect(pricingSnapshot.status).toBe('active');
    expect(pricingSnapshot.currency).toBe('USD');
  });

  it('links every catalog row to a citable source with url and retrievedAt', () => {
    for (const entry of pricingCatalog) {
      const source = sourcesByKey.get(entry.sourceKey);

      expect(source, `${entry.provider}/${entry.model} has a known source`).toBeDefined();
      expect(source?.url).toMatch(/^https:\/\//);
      expect(source?.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('has no duplicate provider/model rows', () => {
    const keys = pricingCatalog.map((entry) => `${entry.provider}/${entry.model}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('prices every chat row with input and output', () => {
    const chatRows = pricingCatalog.filter((entry) => entry.capability === 'chat');

    expect(chatRows.length).toBeGreaterThan(0);
    for (const entry of chatRows) {
      expect(entry.inputPrice, `${entry.model} input`).toBeDefined();
      expect(entry.outputPrice, `${entry.model} output`).toBeDefined();
    }
  });

  it('prices every embedding row with an embedding price', () => {
    const embeddingRows = pricingCatalog.filter((entry) => entry.capability === 'embedding');

    expect(embeddingRows.length).toBeGreaterThan(0);
    for (const entry of embeddingRows) {
      expect(entry.embeddingPrice, `${entry.model} embedding`).toBeDefined();
    }
  });

  it('records cached read pricing for chat models from caching providers', () => {
    const cachingProviders = new Set<string>(CACHING_PROVIDERS);
    const cachingChatRows = pricingCatalog.filter(
      (entry) => entry.capability === 'chat' && cachingProviders.has(entry.provider)
    );

    expect(cachingChatRows.length).toBeGreaterThan(0);
    for (const entry of cachingChatRows) {
      expect(
        entry.cachedInputReadPrice,
        `${entry.provider}/${entry.model} cached read`
      ).toBeDefined();
    }
  });

  it('records a cache write price for Anthropic chat models', () => {
    const anthropicChat = pricingCatalog.filter(
      (entry) => entry.provider === 'Anthropic' && entry.capability === 'chat'
    );

    expect(anthropicChat.length).toBeGreaterThan(0);
    for (const entry of anthropicChat) {
      expect(entry.cacheWritePrice, `${entry.model} cache write`).toBeDefined();
    }
  });

  it('does not price caching for providers that do not offer it', () => {
    const nonCachingChat = pricingCatalog.filter(
      (entry) =>
        entry.capability === 'chat' && (entry.provider === 'Mistral' || entry.provider === 'Cohere')
    );

    for (const entry of nonCachingChat) {
      expect(entry.cachedInputReadPrice).toBeUndefined();
      expect(entry.cacheWritePrice).toBeUndefined();
    }
  });
});

describe('cited text-to-sql benchmarks', () => {
  it('seeds paired accuracy benchmarks', () => {
    expect(textToSqlBenchmarks.length).toBeGreaterThan(0);
  });

  it('links every benchmark to a citable source with url and retrievedAt', () => {
    for (const entry of textToSqlBenchmarks) {
      const source = sourcesByKey.get(entry.sourceKey);

      expect(source, `${entry.benchmark}/${entry.model} has a known source`).toBeDefined();
      expect(source?.url).toMatch(/^https:\/\//);
      expect(source?.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['vendor_benchmark', 'third_party_benchmark']).toContain(source?.sourceType);
    }
  });

  it('reports baseline accuracy as an in-range percentage', () => {
    for (const entry of textToSqlBenchmarks) {
      const baseline = Number(entry.baselineAccuracy);
      expect(baseline).toBeGreaterThanOrEqual(0);
      expect(baseline).toBeLessThanOrEqual(100);
    }
  });

  it('keeps paired semantic accuracy in range and not below baseline', () => {
    // Raw-only benchmarks (BIRD, Spider) report no semantic-layer figure.
    const paired = textToSqlBenchmarks.filter((entry) => entry.semanticAccuracy !== undefined);
    expect(paired.length).toBeGreaterThan(0);

    for (const entry of paired) {
      const semantic = Number(entry.semanticAccuracy);
      expect(semantic).toBeLessThanOrEqual(100);
      expect(semantic).toBeGreaterThanOrEqual(Number(entry.baselineAccuracy));
    }
  });

  it('includes at least one raw-only benchmark (no semantic-layer figure)', () => {
    expect(textToSqlBenchmarks.some((entry) => entry.semanticAccuracy === undefined)).toBe(true);
  });

  it('has no duplicate benchmark/provider/model rows', () => {
    const keys = textToSqlBenchmarks.map(
      (entry) => `${entry.benchmark}/${entry.provider}/${entry.model}`
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('cited RAG retrieval benchmarks', () => {
  it('seeds retrieval-quality scores', () => {
    expect(ragRetrievalBenchmarks.length).toBeGreaterThan(0);
  });

  it('links every retrieval benchmark to a citable source with an in-range score', () => {
    for (const entry of ragRetrievalBenchmarks) {
      const source = sourcesByKey.get(entry.sourceKey);

      expect(source, `${entry.model} has a known source`).toBeDefined();
      expect(source?.url).toMatch(/^https:\/\//);
      expect(source?.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const score = Number(entry.metricValue);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});
