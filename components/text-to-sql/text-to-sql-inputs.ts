// Shared Text-to-SQL calculator input shape and defaults. Lives outside the
// client component so the server page can compute an initial result with the
// same defaults (no first-load flash, no extra round trip).
//
// Accuracy is intentionally NOT an input: it is resolved from the selected
// benchmark scenario (a cited, source-backed result), never typed by the user.

// Sentinel benchmark selection meaning "no benchmark / no semantic layer": only
// the raw scenario is modeled and the semantic-layer section is disabled.
export const NO_BENCHMARK_ID = 'none';

export type TextToSqlCalculatorInputs = {
  model: string;
  benchmarkId: string;
  includeRetry: boolean;
  // Manual accuracy override (ADR 0004): adjusts the selected benchmark's
  // figures for a domain it does not match, kept visually distinct.
  overrideAccuracy: boolean;
  overrideBaselineAccuracy: number;
  overrideSemanticAccuracy: number;
  questionsPerDay: number;
  daysPerMonth: number;
  questionTokens: number;
  schemaContextTokens: number;
  semanticMetadataTokens: number;
  sqlOutputTokens: number;
  validationPromptTokens: number;
  maxRepairAttempts: number;
  promptCacheHitPercentage: number;
};

// The manual-override fields pre-fill from the benchmark so adjusting starts
// from the cited figures rather than zero.
export function overrideDefaults(
  benchmark: { baselineAccuracy: string; semanticAccuracy: string | null } | null
): Pick<TextToSqlCalculatorInputs, 'overrideBaselineAccuracy' | 'overrideSemanticAccuracy'> {
  return {
    overrideBaselineAccuracy: benchmark ? Number(benchmark.baselineAccuracy) : 0,
    overrideSemanticAccuracy:
      benchmark?.semanticAccuracy != null ? Number(benchmark.semanticAccuracy) : 0,
  };
}

export const DEFAULT_TEXT_TO_SQL_INPUTS: Omit<TextToSqlCalculatorInputs, 'model' | 'benchmarkId'> =
  {
    includeRetry: false,
    overrideAccuracy: false,
    overrideBaselineAccuracy: 0,
    overrideSemanticAccuracy: 0,
    questionsPerDay: 200,
    daysPerMonth: 30,
    questionTokens: 40,
    schemaContextTokens: 2500,
    semanticMetadataTokens: 1200,
    sqlOutputTokens: 150,
    validationPromptTokens: 250,
    maxRepairAttempts: 2,
    promptCacheHitPercentage: 60,
  };
