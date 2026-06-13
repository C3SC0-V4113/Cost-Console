export type PricingSnapshotFixture = {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'superseded';
  currency: string;
  freshnessState: 'fresh' | 'stale' | 'review';
  capturedAtLabel: string;
  validFromLabel: string;
  sourceSummary: string;
  notes: string;
};

export const pricingSnapshotFixtures: PricingSnapshotFixture[] = [
  {
    id: '2026-06-core-pricing',
    name: '2026-06 Core Pricing',
    status: 'active',
    currency: 'USD',
    freshnessState: 'fresh',
    capturedAtLabel: 'Captured 2026-06-08',
    validFromLabel: 'Valid from 2026-06-09',
    sourceSummary: 'OpenAI, Anthropic, Gemini, Mistral, Cohere curated monthly refresh.',
    notes: 'Primary snapshot for current playground traceability and comparison baselines.',
  },
  {
    id: '2026-05-rag-benchmark-refresh',
    name: '2026-05 RAG Benchmark Refresh',
    status: 'superseded',
    currency: 'USD',
    freshnessState: 'review',
    capturedAtLabel: 'Captured 2026-05-12',
    validFromLabel: 'Valid from 2026-05-13',
    sourceSummary: 'Monthly pricing sync plus MTEB and BEIR retrieval benchmark notes.',
    notes: 'Kept for historical recalculation after the June pricing refresh.',
  },
  {
    id: '2026-06-vector-storage-draft',
    name: '2026-06 Vector Storage Draft',
    status: 'draft',
    currency: 'USD',
    freshnessState: 'stale',
    capturedAtLabel: 'Captured 2026-06-10',
    validFromLabel: 'Pending approval',
    sourceSummary: 'Optional vector-store storage and query semantics under review.',
    notes: 'Draft comparison pack awaiting manual verification of storage pricing semantics.',
  },
];

export const activePricingSnapshot = pricingSnapshotFixtures[0];

export function getPricingSnapshotFixtureById(snapshotId: string): PricingSnapshotFixture | null {
  return pricingSnapshotFixtures.find((snapshot) => snapshot.id === snapshotId) ?? null;
}
