// Data-transfer types returned by the repository layer. The repository converts
// Prisma `Decimal` to string and `Date` to ISO string at this boundary, because
// neither serializes across the Server -> Client component boundary. Views and
// the calc engine depend on these DTOs, never on Prisma models directly.

export type PricingSnapshotDTO = {
  id: string;
  name: string;
  currency: string;
  status: string;
  freshnessState: string;
  capturedAt: string;
  validFrom: string | null;
  validTo: string | null;
  notes: string | null;
};

export type PricingSourceDTO = {
  title: string;
  url: string;
  sourceType: string;
  sourceDate: string | null;
  retrievedAt: string;
};

export type TextToSqlBenchmarkDTO = {
  id: string;
  benchmark: string;
  provider: string;
  model: string;
  metricType: string;
  isOfficial: boolean;
  baselineAccuracy: string;
  semanticAccuracy: string;
  notes: string | null;
  source: PricingSourceDTO | null;
};

export type PricingCatalogDTO = {
  id: string;
  snapshotId: string;
  provider: string;
  model: string;
  capability: string;
  contextWindowTokens: number | null;
  currency: string;
  priceUnit: string;
  inputPrice: string | null;
  outputPrice: string | null;
  cachedInputReadPrice: string | null;
  cacheWritePrice: string | null;
  embeddingPrice: string | null;
  validityState: string;
  notes: string | null;
  source: PricingSourceDTO | null;
};
