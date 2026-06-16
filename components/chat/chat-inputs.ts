// Shared chat calculator input shape and defaults. Lives outside the client
// component so the server page can compute an initial result with the same
// defaults (no first-load flash, no extra round trip).
export type ChatCalculatorInputs = {
  model: string;
  interactionsPerDay: number;
  daysPerMonth: number;
  systemPromptTokens: number;
  userInputTokens: number;
  historyContextTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  promptCacheHitPercentage: number;
};

export const DEFAULT_CHAT_INPUTS: Omit<ChatCalculatorInputs, 'model'> = {
  interactionsPerDay: 100,
  daysPerMonth: 30,
  systemPromptTokens: 400,
  userInputTokens: 200,
  historyContextTokens: 800,
  cachedInputTokens: 400,
  outputTokens: 300,
  promptCacheHitPercentage: 50,
};
