'use server';

import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { computeRagCost } from '@/lib/calc/rag-cost';
import { getCatalogRowById } from '@/lib/data/pricing-repository';

import type { RagCostResult, RagEmbeddingPricing } from '@/lib/calc/rag-cost';
import type { PricingCatalogDTO } from '@/lib/data/dto';

const TOKEN_LIMIT = 1_000_000_000;

const ragCostInputSchema = z.object({
  ingestionEmbeddingModel: z.string().min(1),
  queryEmbeddingModel: z.string().min(1),
  generationModel: z.string().min(1),
  documentCount: z.number().int().min(0).max(TOKEN_LIMIT),
  avgDocumentTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  cleanupRetentionPercentage: z.number().min(0).max(100),
  chunkSize: z.number().int().min(1).max(TOKEN_LIMIT),
  chunkOverlap: z.number().int().min(0).max(TOKEN_LIMIT),
  queriesPerDay: z.number().int().min(0).max(TOKEN_LIMIT),
  daysPerMonth: z.number().int().min(0).max(31),
  avgQueryTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  topK: z.number().int().min(0).max(10_000),
  avgRetrievedChunkTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  systemPromptTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  expectedOutputTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  promptCacheHitPercentage: z.number().min(0).max(100),
});

export type RagCostActionResult =
  | { ok: true; result: RagCostResult }
  | { ok: false; error: 'unauthorized' | 'invalid' | 'model_unavailable' };

function toEmbeddingPricing(row: PricingCatalogDTO | null): RagEmbeddingPricing | null {
  if (!row || row.capability !== 'embedding' || !row.embeddingPrice) {
    return null;
  }
  return { provider: row.provider, model: row.model, embeddingPrice: row.embeddingPrice };
}

// Backend-owned recompute. The client sends catalog row ids plus pipeline
// assumptions; pricing is re-derived from the active snapshot here so the UI
// never holds or duplicates the economic calculation (README boundary).
// eslint-disable-next-line react-doctor/server-auth-actions -- getCurrentUser() guards the action below
export async function calculateRagCost(raw: unknown): Promise<RagCostActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'unauthorized' };
  }

  const parsed = ragCostInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'invalid' };
  }

  const input = parsed.data;
  const [ingestionRow, queryRow, generationRow] = await Promise.all([
    getCatalogRowById(input.ingestionEmbeddingModel),
    getCatalogRowById(input.queryEmbeddingModel),
    getCatalogRowById(input.generationModel),
  ]);

  const ingestionEmbedding = toEmbeddingPricing(ingestionRow);
  const queryEmbedding = toEmbeddingPricing(queryRow);
  if (
    !ingestionEmbedding ||
    !queryEmbedding ||
    !generationRow ||
    generationRow.capability !== 'chat' ||
    !generationRow.inputPrice ||
    !generationRow.outputPrice
  ) {
    return { ok: false, error: 'model_unavailable' };
  }

  const result = computeRagCost(input, {
    currency: generationRow.currency,
    ingestionEmbedding,
    queryEmbedding,
    generation: {
      provider: generationRow.provider,
      model: generationRow.model,
      inputPrice: generationRow.inputPrice,
      outputPrice: generationRow.outputPrice,
      cachedInputReadPrice: generationRow.cachedInputReadPrice,
      cacheWritePrice: generationRow.cacheWritePrice,
    },
    // No source-backed vector storage price is captured yet (views.md: do not
    // invent storage pricing). Stays null until a cited price is seeded.
    storagePricePerMillionVectorsPerMonth: null,
  });

  return { ok: true, result };
}
