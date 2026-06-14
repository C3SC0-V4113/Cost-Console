import 'server-only';

import { prisma } from '@/lib/prisma';

import type { PricingCatalogDTO, PricingSnapshotDTO } from './dto';

// Structural row shapes the mappers read. Kept independent of the generated
// Prisma types so the mapping stays pure and testable; Prisma model rows satisfy
// these shapes (Decimal has toString, dates are Date, enums are string unions).
type DecimalLike = { toString(): string };

type SnapshotRow = {
  id: string;
  name: string;
  currency: string;
  status: string;
  freshnessState: string;
  capturedAt: Date;
  validFrom: Date | null;
  validTo: Date | null;
  notes: string | null;
};

type SourceRow = {
  title: string;
  url: string;
  sourceType: string;
  sourceDate: Date | null;
  retrievedAt: Date;
};

type CatalogRow = {
  id: string;
  pricingSnapshotId: string;
  provider: string;
  model: string;
  capability: string;
  contextWindowTokens: number | null;
  currency: string;
  priceUnit: string;
  inputPrice: DecimalLike | null;
  outputPrice: DecimalLike | null;
  cachedInputReadPrice: DecimalLike | null;
  cacheWritePrice: DecimalLike | null;
  embeddingPrice: DecimalLike | null;
  validityState: string;
  notes: string | null;
  sourceReference: SourceRow | null;
};

export function toSnapshotDTO(row: SnapshotRow): PricingSnapshotDTO {
  return {
    id: row.id,
    name: row.name,
    currency: row.currency,
    status: row.status,
    freshnessState: row.freshnessState,
    capturedAt: row.capturedAt.toISOString(),
    validFrom: row.validFrom ? row.validFrom.toISOString() : null,
    validTo: row.validTo ? row.validTo.toISOString() : null,
    notes: row.notes,
  };
}

export function toCatalogDTO(row: CatalogRow): PricingCatalogDTO {
  return {
    id: row.id,
    snapshotId: row.pricingSnapshotId,
    provider: row.provider,
    model: row.model,
    capability: row.capability,
    contextWindowTokens: row.contextWindowTokens,
    currency: row.currency,
    priceUnit: row.priceUnit,
    inputPrice: row.inputPrice ? row.inputPrice.toString() : null,
    outputPrice: row.outputPrice ? row.outputPrice.toString() : null,
    cachedInputReadPrice: row.cachedInputReadPrice ? row.cachedInputReadPrice.toString() : null,
    cacheWritePrice: row.cacheWritePrice ? row.cacheWritePrice.toString() : null,
    embeddingPrice: row.embeddingPrice ? row.embeddingPrice.toString() : null,
    validityState: row.validityState,
    notes: row.notes,
    source: row.sourceReference
      ? {
          title: row.sourceReference.title,
          url: row.sourceReference.url,
          sourceType: row.sourceReference.sourceType,
          sourceDate: row.sourceReference.sourceDate
            ? row.sourceReference.sourceDate.toISOString()
            : null,
          retrievedAt: row.sourceReference.retrievedAt.toISOString(),
        }
      : null,
  };
}

export async function getActiveSnapshot(): Promise<PricingSnapshotDTO | null> {
  const row = await prisma.pricingSnapshot.findFirst({
    where: { status: 'active' },
    orderBy: { capturedAt: 'desc' },
  });
  return row ? toSnapshotDTO(row) : null;
}

export async function listSnapshots(): Promise<PricingSnapshotDTO[]> {
  const rows = await prisma.pricingSnapshot.findMany({ orderBy: { capturedAt: 'desc' } });
  return rows.map(toSnapshotDTO);
}

export async function getSnapshotById(id: string): Promise<PricingSnapshotDTO | null> {
  const row = await prisma.pricingSnapshot.findUnique({ where: { id } });
  return row ? toSnapshotDTO(row) : null;
}

export async function listCatalog(snapshotId: string): Promise<PricingCatalogDTO[]> {
  const rows = await prisma.pricingCatalog.findMany({
    where: { pricingSnapshotId: snapshotId },
    include: { sourceReference: true },
    orderBy: [{ provider: 'asc' }, { model: 'asc' }],
  });
  return rows.map(toCatalogDTO);
}
