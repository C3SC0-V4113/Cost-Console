import { describe, expect, it } from 'vitest';

import { buildRagPipeline } from '@/components/rag/rag-pipeline-model';

import type { RagCalculatorInputs } from '@/components/rag/rag-inputs';
import type { RagCostResult } from '@/lib/calc/rag-cost';

const inputs: RagCalculatorInputs = {
  ingestionEmbeddingModel: 'embedding-row',
  queryEmbeddingModel: 'query-row',
  generationModel: 'generation-row',
  documentCount: 12,
  avgDocumentTokens: 800,
  cleanupRetentionPercentage: 80,
  chunkSize: 400,
  chunkOverlap: 40,
  queriesPerDay: 20,
  daysPerMonth: 30,
  avgQueryTokens: 24,
  topK: 3,
  avgRetrievedChunkTokens: 320,
  systemPromptTokens: 150,
  expectedOutputTokens: 90,
  promptCacheHitPercentage: 50,
};

const result: RagCostResult = {
  currency: 'USD',
  ingestion: {
    provider: 'Acme',
    model: 'embed-large',
    effectiveCorpusTokens: '7680',
    expectedChunks: '22',
    totalEmbeddingTokens: '8800',
    cost: '0.00088',
  },
  query: {
    embeddingProvider: 'Acme',
    embeddingModel: 'embed-query',
    queryEmbeddingTokens: '24',
    queryEmbeddingCost: '0.0000024',
    retrievedContextTokens: '960',
    costPerQuery: '0.0012489',
    generation: {
      provider: 'Acme',
      model: 'generate-pro',
      currency: 'USD',
      cacheAvailable: true,
      lineItems: [
        {
          category: 'input',
          label: 'Uncached input',
          tokensPerInteraction: '1059',
          unitPrice: '1',
          costPerInteraction: '0.001059',
        },
        {
          category: 'cached_input',
          label: 'Cached input (read)',
          tokensPerInteraction: '75',
          unitPrice: '0.1',
          costPerInteraction: '0.0000075',
        },
        {
          category: 'output',
          label: 'Output',
          tokensPerInteraction: '90',
          unitPrice: '2',
          costPerInteraction: '0.00018',
        },
      ],
      costPerInteraction: '0.0012465',
      dailyCost: '0.0012465',
      monthlyCost: '0.0012465',
      yearlyCost: '0.014958',
      assumptions: {
        interactionsPerDay: 1,
        daysPerMonth: 1,
        promptCacheHitPercentage: 50,
        provider: 'Acme',
        model: 'generate-pro',
        currency: 'USD',
      },
    },
  },
  dailyQueryCost: '0.024978',
  monthlyQueryCost: '0.74934',
  yearlyQueryCost: '8.99208',
  storage: { available: false },
  monthlyTotal: '0.74934',
  yearlyTotal: '8.99208',
  cacheAvailable: true,
  assumptions: {
    queriesPerDay: 20,
    daysPerMonth: 30,
    topK: 3,
    promptCacheHitPercentage: 50,
    currency: 'USD',
    ingestionModel: 'embed-large',
    queryEmbeddingModel: 'embed-query',
    generationModel: 'generate-pro',
  },
};

describe('buildRagPipeline', () => {
  it('returns an empty graph until a calculated result is available', () => {
    expect(buildRagPipeline(inputs, null)).toEqual({ nodes: [], edges: [] });
  });

  it('maps all nine stages without re-deriving result values', () => {
    const graph = buildRagPipeline(inputs, result);
    expect(graph.nodes.map((node) => node.stage)).toEqual([
      'sourceDocuments',
      'chunking',
      'embeddingIngestion',
      'vectorStorage',
      'queryEmbedding',
      'vectorSearch',
      'retrievedChunks',
      'llmContext',
      'generatedOutput',
    ]);
    expect(graph.nodes).toHaveLength(9);
    expect(graph.nodes.find((node) => node.id === 'chunking')?.metrics).toContainEqual({
      labelKey: 'expectedChunks',
      value: '22',
      kind: 'count',
    });
    expect(graph.nodes.find((node) => node.id === 'llm-context')?.metrics).toContainEqual({
      labelKey: 'uncachedInput',
      value: '1059',
      kind: 'tokens',
    });
    expect(graph.nodes.find((node) => node.id === 'generated-output')?.metrics).toContainEqual({
      labelKey: 'outputCost',
      value: '0.00018',
      kind: 'money',
    });
  });

  it('maps edge quantities directly from the calculated result', () => {
    const { edges } = buildRagPipeline(inputs, result);
    expect(edges).toHaveLength(8);
    expect(edges.find((edge) => edge.id === 'retrieved-context')).toMatchObject({
      source: 'retrieved-chunks',
      target: 'llm-context',
      value: '960',
      kind: 'tokens',
    });
    expect(edges.find((edge) => edge.id === 'generated-output')).toMatchObject({
      value: '90',
      kind: 'tokens',
    });
  });

  it('preserves unavailable and source-backed storage states', () => {
    const unavailable = buildRagPipeline(inputs, result);
    const available = buildRagPipeline(inputs, {
      ...result,
      storage: { available: true, monthlyCost: '4.75' },
    });
    expect(unavailable.nodes.find((node) => node.id === 'vector-storage')?.status).toBe(
      'unavailable'
    );
    expect(available.nodes.find((node) => node.id === 'vector-storage')).toMatchObject({
      status: 'available',
      metrics: expect.arrayContaining([{ labelKey: 'monthlyCost', value: '4.75', kind: 'money' }]),
    });
  });
});
