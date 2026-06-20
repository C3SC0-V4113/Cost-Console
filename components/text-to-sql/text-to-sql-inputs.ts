// Shared Text-to-SQL calculator input shape and defaults. Lives outside the
// client component so the server page can compute an initial result with the
// same defaults (no first-load flash, no extra round trip).
//
// Accuracy is intentionally NOT an input: it is resolved from the selected
// benchmark scenario (a cited, source-backed result), never typed by the user.
export type TextToSqlCalculatorInputs = {
  model: string;
  benchmarkId: string;
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

export const DEFAULT_TEXT_TO_SQL_INPUTS: Omit<TextToSqlCalculatorInputs, 'model' | 'benchmarkId'> =
  {
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
