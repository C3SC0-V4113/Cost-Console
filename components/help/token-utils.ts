// Rough, transparent token heuristic shared by the Token Lab surfaces. It is
// deliberately not a real tokenizer: the UI must label this as approximate
// guidance, never billing math (DESIGN.md).
const CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.round(text.length / CHARS_PER_TOKEN);
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}
