import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { RagCostSummary } from '@/components/rag/rag-cost-summary';
import { computeRagCost } from '@/lib/calc/rag-cost';
import esMessages from '@/messages/es.json';

import type { RagCostInput, RagCostPricing } from '@/lib/calc/rag-cost';
import type { RagRetrievalBenchmarkDTO } from '@/lib/data/dto';

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

function renderSummary(overrides?: Partial<RagCostPricing>) {
  const result = computeRagCost(input, { ...pricing, ...overrides });
  render(
    <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
      <RagCostSummary result={result} />
    </NextIntlClientProvider>
  );
  return result;
}

describe('RagCostSummary', () => {
  it('shows the one-time ingestion separated from recurring cost', () => {
    renderSummary();

    expect(screen.getByText('Ingestión única')).toBeTruthy();
    // 250 chunks from the ingestion math surfaces in the detail line.
    expect(screen.getByText(/250 chunks/u)).toBeTruthy();
  });

  it('breaks down the per-query embedding and recurring totals', () => {
    renderSummary();

    expect(screen.getByText('Embedding de consulta')).toBeTruthy();
    expect(screen.getByText('Total mensual')).toBeTruthy();
    expect(screen.getByText('Total anual')).toBeTruthy();
    // monthly recurring ≈ 23.2515 -> Spanish currency "23,25 US$" (shown in both
    // the per-month rollup and the monthly total).
    expect(screen.getAllByText(/23,25\sUS\$/u).length).toBeGreaterThan(0);
  });

  it('reports storage as unavailable when no source-backed price exists', () => {
    renderSummary();

    expect(screen.getByText('No disponible (sin precio citado)')).toBeTruthy();
  });

  it('shows the cited retrieval-quality score for the embedding model', () => {
    const retrieval: RagRetrievalBenchmarkDTO = {
      benchmark: 'MTEB v2 · English',
      provider: 'OpenAI',
      model: 'text-embedding-3-large',
      metricType: 'mteb_mean',
      metricValue: '64.6',
      notes: null,
      source: {
        title: 'MTEB leaderboard',
        url: 'https://awesomeagents.ai/leaderboards/embedding-model-leaderboard-mteb-april-2026/',
        sourceType: 'third_party_benchmark',
        sourceDate: '2026-04-01',
        retrievedAt: '2026-06-19T00:00:00.000Z',
      },
    };
    render(
      <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
        <RagCostSummary result={computeRagCost(input, pricing)} retrieval={retrieval} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Calidad de recuperación (MTEB)')).toBeTruthy();
    expect(screen.getByText('64,6')).toBeTruthy();
    // Cited via the SourceTag affordance (third-party benchmark).
    expect(screen.getByText('Benchmark de terceros')).toBeTruthy();
  });

  it('renders a placeholder when there is no result', () => {
    render(
      <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
        <RagCostSummary result={null} />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByText('Elegí modelos de embedding y de generación para estimar el costo de RAG.')
    ).toBeTruthy();
  });
});
