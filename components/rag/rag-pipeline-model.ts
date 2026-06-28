import type { RagCalculatorInputs } from './rag-inputs';
import type { RagCostResult } from '@/lib/calc/rag-cost';

export type PipelineStage =
  | 'sourceDocuments'
  | 'chunking'
  | 'embeddingIngestion'
  | 'vectorStorage'
  | 'queryEmbedding'
  | 'vectorSearch'
  | 'retrievedChunks'
  | 'llmContext'
  | 'generatedOutput';
export type PipelineValueKind = 'count' | 'money' | 'percent' | 'text' | 'tokens';
export type PipelineStatus = 'available' | 'estimated' | 'unavailable';
export type PipelineMetric = { labelKey: string; value: number | string; kind: PipelineValueKind };
export type PipelineNode = {
  id: string;
  stage: PipelineStage;
  status: PipelineStatus;
  metrics: PipelineMetric[];
};
export type PipelineEdge = {
  id: string;
  source: string;
  target: string;
  labelKey: string;
  value: number | string;
  kind: Exclude<PipelineValueKind, 'money' | 'percent'>;
};
export type RagPipeline = { nodes: PipelineNode[]; edges: PipelineEdge[] };

function lineMetric(
  result: RagCostResult,
  category: 'cache_write' | 'cached_input' | 'input' | 'output',
  labelKey: string
): PipelineMetric | null {
  const item = result.query.generation.lineItems.find(
    (candidate) => candidate.category === category
  );
  return item ? { labelKey, value: item.tokensPerInteraction, kind: 'tokens' } : null;
}

export function buildRagPipeline(
  inputs: RagCalculatorInputs,
  result: RagCostResult | null
): RagPipeline {
  if (!result) return { nodes: [], edges: [] };

  const contextMetrics: PipelineMetric[] = [
    { labelKey: 'generationModel', value: result.query.generation.model, kind: 'text' },
    { labelKey: 'systemPromptTokens', value: inputs.systemPromptTokens, kind: 'tokens' },
    { labelKey: 'questionTokens', value: result.query.queryEmbeddingTokens, kind: 'tokens' },
    {
      labelKey: 'retrievedContextTokens',
      value: result.query.retrievedContextTokens,
      kind: 'tokens',
    },
  ];
  for (const metric of [
    lineMetric(result, 'input', 'uncachedInput'),
    lineMetric(result, 'cached_input', 'cachedInput'),
    lineMetric(result, 'cache_write', 'cacheWrite'),
  ]) {
    if (metric) contextMetrics.push(metric);
  }

  const outputItem = result.query.generation.lineItems.find((item) => item.category === 'output');
  const outputMetrics: PipelineMetric[] = [
    { labelKey: 'expectedOutputTokens', value: inputs.expectedOutputTokens, kind: 'tokens' },
  ];
  if (outputItem) {
    outputMetrics.push({
      labelKey: 'billedOutputTokens',
      value: outputItem.tokensPerInteraction,
      kind: 'tokens',
    });
    outputMetrics.push({
      labelKey: 'outputCost',
      value: outputItem.costPerInteraction,
      kind: 'money',
    });
  }

  const storageMetrics: PipelineMetric[] = [
    { labelKey: 'storedChunks', value: result.ingestion.expectedChunks, kind: 'count' },
  ];
  storageMetrics.push(
    result.storage.available
      ? { labelKey: 'monthlyCost', value: result.storage.monthlyCost, kind: 'money' }
      : { labelKey: 'storagePrice', value: 'unavailable', kind: 'text' }
  );

  const nodes: PipelineNode[] = [
    {
      id: 'source-documents',
      stage: 'sourceDocuments',
      status: 'estimated',
      metrics: [
        { labelKey: 'documentCount', value: inputs.documentCount, kind: 'count' },
        { labelKey: 'avgDocumentTokens', value: inputs.avgDocumentTokens, kind: 'tokens' },
        {
          labelKey: 'effectiveCorpusTokens',
          value: result.ingestion.effectiveCorpusTokens,
          kind: 'tokens',
        },
      ],
    },
    {
      id: 'chunking',
      stage: 'chunking',
      status: 'estimated',
      metrics: [
        { labelKey: 'chunkSize', value: inputs.chunkSize, kind: 'tokens' },
        { labelKey: 'chunkOverlap', value: inputs.chunkOverlap, kind: 'tokens' },
        { labelKey: 'cleanupRetention', value: inputs.cleanupRetentionPercentage, kind: 'percent' },
        { labelKey: 'expectedChunks', value: result.ingestion.expectedChunks, kind: 'count' },
      ],
    },
    {
      id: 'embedding-ingestion',
      stage: 'embeddingIngestion',
      status: 'estimated',
      metrics: [
        { labelKey: 'model', value: result.ingestion.model, kind: 'text' },
        {
          labelKey: 'embeddingTokens',
          value: result.ingestion.totalEmbeddingTokens,
          kind: 'tokens',
        },
        { labelKey: 'oneTimeCost', value: result.ingestion.cost, kind: 'money' },
      ],
    },
    {
      id: 'vector-storage',
      stage: 'vectorStorage',
      status: result.storage.available ? 'available' : 'unavailable',
      metrics: storageMetrics,
    },
    {
      id: 'query-embedding',
      stage: 'queryEmbedding',
      status: 'estimated',
      metrics: [
        { labelKey: 'model', value: result.query.embeddingModel, kind: 'text' },
        { labelKey: 'queryTokens', value: result.query.queryEmbeddingTokens, kind: 'tokens' },
        { labelKey: 'costPerQuery', value: result.query.queryEmbeddingCost, kind: 'money' },
      ],
    },
    {
      id: 'vector-search',
      stage: 'vectorSearch',
      status: 'estimated',
      metrics: [
        { labelKey: 'topK', value: inputs.topK, kind: 'count' },
        { labelKey: 'scoreThreshold', value: 'notConfigured', kind: 'text' },
        { labelKey: 'searchMode', value: 'vector', kind: 'text' },
      ],
    },
    {
      id: 'retrieved-chunks',
      stage: 'retrievedChunks',
      status: 'estimated',
      metrics: [
        { labelKey: 'retrievedChunks', value: inputs.topK, kind: 'count' },
        {
          labelKey: 'avgRetrievedChunkTokens',
          value: inputs.avgRetrievedChunkTokens,
          kind: 'tokens',
        },
        {
          labelKey: 'retrievedContextTokens',
          value: result.query.retrievedContextTokens,
          kind: 'tokens',
        },
      ],
    },
    { id: 'llm-context', stage: 'llmContext', status: 'estimated', metrics: contextMetrics },
    {
      id: 'generated-output',
      stage: 'generatedOutput',
      status: 'estimated',
      metrics: outputMetrics,
    },
  ];

  const edges: PipelineEdge[] = [
    {
      id: 'clean-corpus',
      source: 'source-documents',
      target: 'chunking',
      labelKey: 'effectiveCorpus',
      value: result.ingestion.effectiveCorpusTokens,
      kind: 'tokens',
    },
    {
      id: 'chunks-to-embed',
      source: 'chunking',
      target: 'embedding-ingestion',
      labelKey: 'embeddingTokens',
      value: result.ingestion.totalEmbeddingTokens,
      kind: 'tokens',
    },
    {
      id: 'vectors-to-store',
      source: 'embedding-ingestion',
      target: 'vector-storage',
      labelKey: 'vectors',
      value: result.ingestion.expectedChunks,
      kind: 'count',
    },
    {
      id: 'query',
      source: 'vector-storage',
      target: 'query-embedding',
      labelKey: 'queryTokens',
      value: result.query.queryEmbeddingTokens,
      kind: 'tokens',
    },
    {
      id: 'query-vector',
      source: 'query-embedding',
      target: 'vector-search',
      labelKey: 'queryTokens',
      value: result.query.queryEmbeddingTokens,
      kind: 'tokens',
    },
    {
      id: 'search-results',
      source: 'vector-search',
      target: 'retrieved-chunks',
      labelKey: 'retrievedContext',
      value: result.query.retrievedContextTokens,
      kind: 'tokens',
    },
    {
      id: 'retrieved-context',
      source: 'retrieved-chunks',
      target: 'llm-context',
      labelKey: 'retrievedContext',
      value: result.query.retrievedContextTokens,
      kind: 'tokens',
    },
    {
      id: 'generated-output',
      source: 'llm-context',
      target: 'generated-output',
      labelKey: 'generatedOutput',
      value: outputItem?.tokensPerInteraction ?? inputs.expectedOutputTokens,
      kind: 'tokens',
    },
  ];
  return { nodes, edges };
}
