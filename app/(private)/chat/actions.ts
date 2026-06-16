'use server';

import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { computeChatCost } from '@/lib/calc/chat-cost';
import { getCatalogRowById } from '@/lib/data/pricing-repository';

import type { ChatCostResult } from '@/lib/calc/chat-cost';

const TOKEN_LIMIT = 100_000_000;

const chatCostInputSchema = z.object({
  model: z.string().min(1),
  interactionsPerDay: z.number().int().min(0).max(TOKEN_LIMIT),
  daysPerMonth: z.number().int().min(0).max(31),
  systemPromptTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  userInputTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  historyContextTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  cachedInputTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  outputTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  promptCacheHitPercentage: z.number().min(0).max(100),
});

export type ChatCostActionResult =
  | { ok: true; result: ChatCostResult }
  | { ok: false; error: 'unauthorized' | 'invalid' | 'model_unavailable' };

// Backend-owned recompute. The client sends the selected catalog row id plus
// token assumptions; pricing is re-derived from the active snapshot here so the
// UI never holds or duplicates the economic calculation (README boundary).
// eslint-disable-next-line react-doctor/server-auth-actions -- getCurrentUser() guards the action below
export async function calculateChatCost(raw: unknown): Promise<ChatCostActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'unauthorized' };
  }

  const parsed = chatCostInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'invalid' };
  }

  const input = parsed.data;
  const row = await getCatalogRowById(input.model);
  if (!row || row.capability !== 'chat' || !row.inputPrice || !row.outputPrice) {
    return { ok: false, error: 'model_unavailable' };
  }

  const result = computeChatCost(input, {
    provider: row.provider,
    model: row.model,
    currency: row.currency,
    inputPrice: row.inputPrice,
    outputPrice: row.outputPrice,
    cachedInputReadPrice: row.cachedInputReadPrice,
    cacheWritePrice: row.cacheWritePrice,
  });

  return { ok: true, result };
}
