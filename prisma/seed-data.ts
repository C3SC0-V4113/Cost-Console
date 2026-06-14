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

// Date every price row was retrieved from its official source.
export const RETRIEVED_AT = '2026-06-14';

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
