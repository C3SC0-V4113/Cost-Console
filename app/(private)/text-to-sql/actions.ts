'use server';

import { z } from 'zod';

import { NO_BENCHMARK_ID } from '@/components/text-to-sql/text-to-sql-inputs';
import { getCurrentUser } from '@/lib/auth';
import { computeTextToSqlCost } from '@/lib/calc/text-to-sql-cost';
import { listTextToSqlBenchmarks } from '@/lib/data/benchmark-repository';
import { getCatalogRowById } from '@/lib/data/pricing-repository';

import type { TextToSqlCostResult } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';

const TOKEN_LIMIT = 1_000_000_000;

const textToSqlCostInputSchema = z.object({
  model: z.string().min(1),
  benchmarkId: z.string().min(1),
  includeRetry: z.boolean(),
  questionsPerDay: z.number().int().min(0).max(TOKEN_LIMIT),
  daysPerMonth: z.number().int().min(0).max(31),
  questionTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  schemaContextTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  semanticMetadataTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  sqlOutputTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  validationPromptTokens: z.number().int().min(0).max(TOKEN_LIMIT),
  maxRepairAttempts: z.number().int().min(0).max(20),
  promptCacheHitPercentage: z.number().min(0).max(100),
  // Manual accuracy override for domains the benchmark does not match (ADR 0004).
  overrideAccuracy: z.boolean(),
  overrideBaselineAccuracy: z.number().min(0).max(100),
  overrideSemanticAccuracy: z.number().min(0).max(100),
});

export type TextToSqlCostActionResult =
  | { ok: true; result: TextToSqlCostResult; benchmark: TextToSqlBenchmarkDTO | null }
  | {
      ok: false;
      error: 'unauthorized' | 'invalid' | 'model_unavailable' | 'benchmark_unavailable';
    };

// Backend-owned recompute. The client sends the catalog row id (cost) and the
// benchmark scenario id (accuracy); both are re-derived from the active snapshot
// here so the UI never holds or invents either value (README boundary,
// ADR 0006, ADR 0009). A `none` benchmark models raw cost without an accuracy
// claim and without the semantic scenarios.
// eslint-disable-next-line react-doctor/server-auth-actions -- getCurrentUser() guards the action below
export async function calculateTextToSqlCost(raw: unknown): Promise<TextToSqlCostActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'unauthorized' };
  }

  const parsed = textToSqlCostInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'invalid' };
  }

  const input = parsed.data;
  const hasBenchmarkSelected = input.benchmarkId !== NO_BENCHMARK_ID;
  const [row, benchmarks] = await Promise.all([
    getCatalogRowById(input.model),
    hasBenchmarkSelected ? listTextToSqlBenchmarks() : Promise.resolve([]),
  ]);

  if (!row || row.capability !== 'chat' || !row.inputPrice || !row.outputPrice) {
    return { ok: false, error: 'model_unavailable' };
  }

  const benchmark = hasBenchmarkSelected
    ? (benchmarks.find((entry) => entry.id === input.benchmarkId) ?? null)
    : null;
  if (hasBenchmarkSelected && !benchmark) {
    return { ok: false, error: 'benchmark_unavailable' };
  }

  // The benchmark defines the scenario structure (raw-only vs paired); the manual
  // override only adjusts the numbers, keeping that structure.
  const baselineAccuracyPercentage = benchmark
    ? input.overrideAccuracy
      ? input.overrideBaselineAccuracy
      : Number(benchmark.baselineAccuracy)
    : null;
  const semanticAccuracyPercentage =
    benchmark && benchmark.semanticAccuracy !== null
      ? input.overrideAccuracy
        ? input.overrideSemanticAccuracy
        : Number(benchmark.semanticAccuracy)
      : null;
  const isPaired = semanticAccuracyPercentage !== null;

  const result = computeTextToSqlCost(
    {
      ...input,
      includeSemantic: isPaired,
      includeRetry: input.includeRetry && isPaired,
      baselineAccuracyPercentage,
      semanticAccuracyPercentage,
    },
    {
      currency: row.currency,
      generation: {
        provider: row.provider,
        model: row.model,
        inputPrice: row.inputPrice,
        outputPrice: row.outputPrice,
        cachedInputReadPrice: row.cachedInputReadPrice,
      },
      // No source-backed warehouse execution price is captured yet (views.md: do
      // not invent execution cost). Stays null until a cited price is seeded.
      warehousePricePerThousandQueries: null,
    }
  );

  return { ok: true, result, benchmark };
}
