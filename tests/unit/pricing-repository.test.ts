import Decimal from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  snapshotFindFirst: vi.fn(),
  snapshotFindMany: vi.fn(),
  snapshotFindUnique: vi.fn(),
  catalogFindMany: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pricingSnapshot: {
      findFirst: mocks.snapshotFindFirst,
      findMany: mocks.snapshotFindMany,
      findUnique: mocks.snapshotFindUnique,
    },
    pricingCatalog: {
      findMany: mocks.catalogFindMany,
    },
  },
}));

const { getActiveSnapshot, listCatalog, toCatalogDTO } =
  await import('@/lib/data/pricing-repository');

const snapshotRow = {
  id: 's1',
  name: 'Snapshot',
  currency: 'USD',
  status: 'active',
  freshnessState: 'fresh',
  capturedAt: new Date('2026-06-08T00:00:00.000Z'),
  validFrom: new Date('2026-06-09T00:00:00.000Z'),
  validTo: null,
  notes: 'baseline',
};

const catalogRow = {
  id: 'c1',
  pricingSnapshotId: 's1',
  provider: 'OpenAI',
  model: 'gpt-5.4',
  capability: 'chat',
  contextWindowTokens: null,
  currency: 'USD',
  priceUnit: 'per_1m_tokens',
  inputPrice: new Decimal('2.5'),
  outputPrice: new Decimal('15'),
  cachedInputReadPrice: new Decimal('0.25'),
  cacheWritePrice: null,
  embeddingPrice: null,
  validityState: 'active',
  notes: null,
  sourceReference: {
    title: 'OpenAI API Pricing',
    url: 'https://developers.openai.com/api/docs/pricing',
    sourceType: 'official_pricing',
    sourceDate: null,
    retrievedAt: new Date('2026-06-14T00:00:00.000Z'),
  },
};

describe('pricing repository', () => {
  it('maps the active snapshot, converting dates to ISO strings', async () => {
    mocks.snapshotFindFirst.mockResolvedValue(snapshotRow);

    const dto = await getActiveSnapshot();

    expect(mocks.snapshotFindFirst).toHaveBeenCalledWith({
      where: { status: 'active' },
      orderBy: { capturedAt: 'desc' },
    });
    expect(dto?.capturedAt).toBe('2026-06-08T00:00:00.000Z');
    expect(dto?.validFrom).toBe('2026-06-09T00:00:00.000Z');
    expect(dto?.validTo).toBeNull();
  });

  it('returns null when there is no active snapshot', async () => {
    mocks.snapshotFindFirst.mockResolvedValue(null);

    expect(await getActiveSnapshot()).toBeNull();
  });

  it('maps catalog rows, converting Decimal prices to strings and including the source', async () => {
    mocks.catalogFindMany.mockResolvedValue([catalogRow]);

    const rows = await listCatalog('s1');

    expect(mocks.catalogFindMany).toHaveBeenCalledWith({
      where: { pricingSnapshotId: 's1' },
      include: { sourceReference: true },
      orderBy: [{ provider: 'asc' }, { model: 'asc' }],
    });
    expect(rows[0].inputPrice).toBe('2.5');
    expect(rows[0].cachedInputReadPrice).toBe('0.25');
    expect(rows[0].cacheWritePrice).toBeNull();
    expect(rows[0].source?.url).toBe('https://developers.openai.com/api/docs/pricing');
    expect(rows[0].source?.retrievedAt).toBe('2026-06-14T00:00:00.000Z');
  });

  it('maps a catalog row with no source reference to a null source', () => {
    const dto = toCatalogDTO({ ...catalogRow, sourceReference: null });

    expect(dto.source).toBeNull();
    expect(dto.embeddingPrice).toBeNull();
  });
});
