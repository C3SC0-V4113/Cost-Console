// Shared RAG calculator input shape and defaults. Lives outside the client
// component so the server page can compute an initial result with the same
// defaults (no first-load flash, no extra round trip).
export type RagCalculatorInputs = {
  ingestionEmbeddingModel: string;
  queryEmbeddingModel: string;
  generationModel: string;
  documentCount: number;
  avgDocumentTokens: number;
  cleanupRetentionPercentage: number;
  chunkSize: number;
  chunkOverlap: number;
  queriesPerDay: number;
  daysPerMonth: number;
  avgQueryTokens: number;
  topK: number;
  avgRetrievedChunkTokens: number;
  systemPromptTokens: number;
  expectedOutputTokens: number;
  promptCacheHitPercentage: number;
};

export type RagModelSelection = Pick<
  RagCalculatorInputs,
  'ingestionEmbeddingModel' | 'queryEmbeddingModel' | 'generationModel'
>;

export const DEFAULT_RAG_INPUTS: Omit<RagCalculatorInputs, keyof RagModelSelection> = {
  documentCount: 1000,
  avgDocumentTokens: 1200,
  cleanupRetentionPercentage: 85,
  chunkSize: 512,
  chunkOverlap: 64,
  queriesPerDay: 500,
  daysPerMonth: 30,
  avgQueryTokens: 60,
  topK: 5,
  avgRetrievedChunkTokens: 400,
  systemPromptTokens: 350,
  expectedOutputTokens: 300,
  promptCacheHitPercentage: 50,
};
