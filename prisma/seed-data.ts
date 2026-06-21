// Curated, cited pricing seed for Cost Console.
//
// Every price below was captured from an official source on RETRIEVED_AT and is
// linked to a CitedSource so the value stays consultable (ADR 0006: curated
// snapshots, never live runtime queries). Money is stored as decimal strings to
// avoid floating-point drift. This module is pure data — no database access — so
// it can be asserted in unit tests without a running Postgres.

export type SourceType =
  | 'official_pricing'
  | 'official_docs'
  | 'third_party_benchmark'
  | 'vendor_benchmark'
  | 'internal_manual';

export type ModelCapability = 'chat' | 'embedding' | 'reranking' | 'image';

export type CitedSource = {
  key: string;
  sourceType: SourceType;
  title: string;
  url: string;
  provider: string;
  sourceDate?: string;
  retrievedAt: string;
  notes?: string;
};

export type CatalogEntry = {
  sourceKey: string;
  provider: string;
  model: string;
  capability: ModelCapability;
  contextWindowTokens?: number;
  currency: string;
  priceUnit: string;
  inputPrice?: string;
  outputPrice?: string;
  cachedInputReadPrice?: string;
  cacheWritePrice?: string;
  embeddingPrice?: string;
  notes?: string;
};

export type SnapshotSeed = {
  name: string;
  currency: string;
  capturedAt: string;
  freshnessState: 'fresh' | 'stale' | 'review';
  status: 'draft' | 'active' | 'superseded' | 'archived';
  notes: string;
};

// A cited Text-to-SQL accuracy benchmark. A paired study reports a model's
// accuracy both without a semantic layer (baseline) and with it; a raw-only
// benchmark (e.g. BIRD, Spider) reports just the baseline and omits
// `semanticAccuracy`. Each entry expands to one `benchmark_result` row per
// reported metric so accuracy is a source-backed result, never a guess.
export type BenchmarkEntry = {
  sourceKey: string;
  benchmark: string;
  provider: string;
  model: string;
  metricType: string;
  isOfficial: boolean;
  baselineAccuracy: string;
  semanticAccuracy?: string;
  notes?: string;
};

// Date every price row was retrieved from its official source.
export const RETRIEVED_AT = '2026-06-14';

// Date the Text-to-SQL benchmarks were retrieved from their published studies.
export const BENCHMARK_RETRIEVED_AT = '2026-06-19';

// Providers that publish prompt/context caching pricing. Used by tests and the
// UI to distinguish "no cache price" from "cache not offered".
export const CACHING_PROVIDERS = ['OpenAI', 'Anthropic', 'Google'] as const;

export const pricingSnapshot: SnapshotSeed = {
  name: '2026-06 Curated Core Pricing',
  currency: 'USD',
  capturedAt: RETRIEVED_AT,
  freshnessState: 'fresh',
  status: 'active',
  notes:
    'Curated monthly refresh of official chat and embedding pricing for OpenAI, Anthropic, Google Gemini, Mistral, and Cohere.',
};

export const citedSources: CitedSource[] = [
  {
    key: 'openai-chat',
    sourceType: 'official_pricing',
    title: 'OpenAI API Pricing',
    url: 'https://developers.openai.com/api/docs/pricing',
    provider: 'OpenAI',
    retrievedAt: RETRIEVED_AT,
  },
  {
    key: 'openai-embeddings',
    sourceType: 'official_pricing',
    title: 'OpenAI text-embedding-3 pricing',
    url: 'https://developers.openai.com/api/docs/models/text-embedding-3-small',
    provider: 'OpenAI',
    retrievedAt: RETRIEVED_AT,
  },
  {
    key: 'anthropic',
    sourceType: 'official_pricing',
    title: 'Anthropic Claude API Pricing',
    url: 'https://platform.claude.com/docs/en/about-claude/pricing',
    provider: 'Anthropic',
    retrievedAt: RETRIEVED_AT,
    notes:
      'cacheWritePrice stores the 5-minute cache write rate; the 1-hour rate is 2x base input.',
  },
  {
    key: 'gemini',
    sourceType: 'official_pricing',
    title: 'Gemini API Pricing',
    url: 'https://ai.google.dev/gemini-api/docs/pricing',
    provider: 'Google',
    sourceDate: '2026-06-09',
    retrievedAt: RETRIEVED_AT,
    notes:
      'Prices shown for the <=200k-token tier. Context caching also has a $4.50/1M tokens/hour storage cost not modeled as a per-token write.',
  },
  {
    key: 'mistral',
    sourceType: 'official_pricing',
    title: 'Mistral AI Pricing',
    url: 'https://mistral.ai/pricing',
    provider: 'Mistral',
    retrievedAt: RETRIEVED_AT,
    notes: 'Mistral does not publish prompt caching pricing for these models.',
  },
  {
    key: 'cohere',
    sourceType: 'official_pricing',
    title: 'Cohere Pricing',
    url: 'https://cohere.com/pricing',
    provider: 'Cohere',
    retrievedAt: RETRIEVED_AT,
    notes: 'Cohere does not publish prompt caching pricing for these models.',
  },
  {
    key: 'dbt-sl-benchmark',
    sourceType: 'vendor_benchmark',
    title: 'Semantic Layer vs. Text-to-SQL: 2026 Benchmark Update',
    url: 'https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026',
    provider: 'dbt Labs',
    sourceDate: '2026-04-07',
    retrievedAt: BENCHMARK_RETRIEVED_AT,
    notes:
      'Official dbt Labs benchmark on the ACME Insurance dataset, execution accuracy. dbt is a native, platform-integrated semantic layer.',
  },
  {
    key: 'cube-sl-benchmark',
    sourceType: 'vendor_benchmark',
    title:
      'Why semantic layers make LLM analytics reliable: a paired benchmark across three frontier models',
    url: 'https://cube.dev/blog/why-semantic-layers-make-llm-analytics-reliable-a-paired-benchmark-across-three-frontier-models',
    provider: 'Cube',
    sourceDate: '2026-04-28',
    retrievedAt: BENCHMARK_RETRIEVED_AT,
    notes:
      'Cube vendor benchmark on the Contoso Retail (ClickHouse) dataset, 100 questions. Cube is a headless semantic layer.',
  },
  {
    key: 'bird-benchmark',
    sourceType: 'third_party_benchmark',
    title: 'Evaluating LLMs for Text-to-SQL with PremSQL',
    url: 'https://blog.premai.io/evaluating-llms-for-text-to-sql-with-premsql/',
    provider: 'Prem AI',
    retrievedAt: BENCHMARK_RETRIEVED_AT,
    notes:
      'Third-party evaluation on a 300-sample BIRD dev subset, execution accuracy. Raw Text-to-SQL with no semantic layer.',
  },
  {
    key: 'spider-benchmark',
    sourceType: 'third_party_benchmark',
    title: 'Text-to-SQL Empowered by Large Language Models: A Benchmark Evaluation (DAIL-SQL)',
    url: 'https://arxiv.org/abs/2308.15363',
    provider: 'Gao et al.',
    sourceDate: '2023-08-29',
    retrievedAt: BENCHMARK_RETRIEVED_AT,
    notes:
      'Spider dev execution accuracy, GPT-4 baseline packing the full schema into the prompt. Raw Text-to-SQL with no semantic layer.',
  },
];

// Text-to-SQL accuracy benchmarks. Accuracy is reported per model with and
// without a semantic layer, so the lab reads it as a cited result instead of a
// free input. Model names are the real benchmarked models from each study and
// are independent of the simulated pricing catalog.
export const textToSqlBenchmarks: BenchmarkEntry[] = [
  // dbt Labs — native semantic layer (official, ACME Insurance, execution accuracy).
  {
    sourceKey: 'dbt-sl-benchmark',
    benchmark: 'dbt Semantic Layer · ACME Insurance',
    provider: 'Anthropic',
    model: 'claude-sonnet-4-6',
    metricType: 'execution_accuracy',
    isOfficial: true,
    baselineAccuracy: '90.0',
    semanticAccuracy: '98.2',
  },
  {
    sourceKey: 'dbt-sl-benchmark',
    benchmark: 'dbt Semantic Layer · ACME Insurance',
    provider: 'OpenAI',
    model: 'gpt-5.3-codex',
    metricType: 'execution_accuracy',
    isOfficial: true,
    baselineAccuracy: '84.1',
    semanticAccuracy: '100.0',
  },
  // Cube — headless semantic layer (vendor, Contoso Retail, execution accuracy).
  {
    sourceKey: 'cube-sl-benchmark',
    benchmark: 'Cube · Contoso Retail',
    provider: 'Anthropic',
    model: 'claude-opus-4-7',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '50.5',
    semanticAccuracy: '67.7',
  },
  {
    sourceKey: 'cube-sl-benchmark',
    benchmark: 'Cube · Contoso Retail',
    provider: 'Anthropic',
    model: 'claude-sonnet-4-6',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '46.5',
    semanticAccuracy: '68.7',
  },
  {
    sourceKey: 'cube-sl-benchmark',
    benchmark: 'Cube · Contoso Retail',
    provider: 'OpenAI',
    model: 'gpt-5.4',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '45.5',
    semanticAccuracy: '68.7',
  },
  // BIRD — raw Text-to-SQL reference (no semantic layer), third-party eval.
  {
    sourceKey: 'bird-benchmark',
    benchmark: 'BIRD · dev subset',
    provider: 'Meta',
    model: 'Llama 3.1 405B',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '45.66',
  },
  {
    sourceKey: 'bird-benchmark',
    benchmark: 'BIRD · dev subset',
    provider: 'OpenAI',
    model: 'GPT-4o',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '44.0',
  },
  {
    sourceKey: 'bird-benchmark',
    benchmark: 'BIRD · dev subset',
    provider: 'OpenAI',
    model: 'GPT-4o mini',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '34.63',
  },
  {
    sourceKey: 'bird-benchmark',
    benchmark: 'BIRD · dev subset',
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '33.33',
  },
  // Spider — raw Text-to-SQL reference (no semantic layer).
  {
    sourceKey: 'spider-benchmark',
    benchmark: 'Spider · dev',
    provider: 'OpenAI',
    model: 'GPT-4 (full schema)',
    metricType: 'execution_accuracy',
    isOfficial: false,
    baselineAccuracy: '70.0',
  },
];

export const pricingCatalog: CatalogEntry[] = [
  // --- OpenAI chat (cached input priced; no separate cache write charge) ---
  {
    sourceKey: 'openai-chat',
    provider: 'OpenAI',
    model: 'gpt-5.5',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '5.00',
    cachedInputReadPrice: '0.50',
    outputPrice: '30.00',
  },
  {
    sourceKey: 'openai-chat',
    provider: 'OpenAI',
    model: 'gpt-5.4',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '2.50',
    cachedInputReadPrice: '0.25',
    outputPrice: '15.00',
  },
  {
    sourceKey: 'openai-chat',
    provider: 'OpenAI',
    model: 'gpt-5.4-mini',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.75',
    cachedInputReadPrice: '0.075',
    outputPrice: '4.50',
  },
  {
    sourceKey: 'openai-chat',
    provider: 'OpenAI',
    model: 'gpt-5.4-nano',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.20',
    cachedInputReadPrice: '0.02',
    outputPrice: '1.25',
  },
  // --- OpenAI embeddings ---
  {
    sourceKey: 'openai-embeddings',
    provider: 'OpenAI',
    model: 'text-embedding-3-small',
    capability: 'embedding',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    embeddingPrice: '0.02',
  },
  {
    sourceKey: 'openai-embeddings',
    provider: 'OpenAI',
    model: 'text-embedding-3-large',
    capability: 'embedding',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    embeddingPrice: '0.13',
  },
  // --- Anthropic chat (cache read + 5m cache write priced) ---
  {
    sourceKey: 'anthropic',
    provider: 'Anthropic',
    model: 'claude-opus-4-5',
    capability: 'chat',
    contextWindowTokens: 200000,
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '5.00',
    cachedInputReadPrice: '0.50',
    cacheWritePrice: '6.25',
    outputPrice: '25.00',
  },
  {
    sourceKey: 'anthropic',
    provider: 'Anthropic',
    model: 'claude-sonnet-4-5',
    capability: 'chat',
    contextWindowTokens: 200000,
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '3.00',
    cachedInputReadPrice: '0.30',
    cacheWritePrice: '3.75',
    outputPrice: '15.00',
  },
  {
    sourceKey: 'anthropic',
    provider: 'Anthropic',
    model: 'claude-haiku-4-5',
    capability: 'chat',
    contextWindowTokens: 200000,
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '1.00',
    cachedInputReadPrice: '0.10',
    cacheWritePrice: '1.25',
    outputPrice: '5.00',
  },
  // --- Google Gemini chat (context caching priced as cached read) ---
  {
    sourceKey: 'gemini',
    provider: 'Google',
    model: 'gemini-2.5-pro',
    capability: 'chat',
    contextWindowTokens: 200000,
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '1.25',
    cachedInputReadPrice: '0.125',
    outputPrice: '10.00',
    notes: 'Prices for the <=200k-token tier; larger prompts are billed at higher rates.',
  },
  {
    sourceKey: 'gemini',
    provider: 'Google',
    model: 'gemini-2.5-flash',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.30',
    cachedInputReadPrice: '0.03',
    outputPrice: '2.50',
  },
  {
    sourceKey: 'gemini',
    provider: 'Google',
    model: 'gemini-2.5-flash-lite',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.10',
    cachedInputReadPrice: '0.01',
    outputPrice: '0.40',
  },
  // --- Google Gemini embeddings ---
  {
    sourceKey: 'gemini',
    provider: 'Google',
    model: 'gemini-embedding',
    capability: 'embedding',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    embeddingPrice: '0.15',
  },
  // --- Mistral chat (no caching offered) ---
  {
    sourceKey: 'mistral',
    provider: 'Mistral',
    model: 'mistral-medium-3.5',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '1.50',
    outputPrice: '7.50',
  },
  {
    sourceKey: 'mistral',
    provider: 'Mistral',
    model: 'mistral-large-3',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.50',
    outputPrice: '1.50',
  },
  {
    sourceKey: 'mistral',
    provider: 'Mistral',
    model: 'mistral-small-4',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.10',
    outputPrice: '0.30',
  },
  // --- Mistral embeddings ---
  {
    sourceKey: 'mistral',
    provider: 'Mistral',
    model: 'mistral-embed',
    capability: 'embedding',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    embeddingPrice: '0.10',
  },
  // --- Cohere chat (no caching offered) ---
  {
    sourceKey: 'cohere',
    provider: 'Cohere',
    model: 'command-r-plus-08-2024',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '2.50',
    outputPrice: '10.00',
  },
  {
    sourceKey: 'cohere',
    provider: 'Cohere',
    model: 'command-r-03-2024',
    capability: 'chat',
    currency: 'USD',
    priceUnit: 'per_1m_tokens',
    inputPrice: '0.50',
    outputPrice: '1.50',
  },
];
