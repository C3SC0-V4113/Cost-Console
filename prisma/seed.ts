import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

import { citedSources, pricingCatalog, pricingSnapshot } from './seed-data';
import { PrismaClient } from '../lib/generated/prisma/client';

// Prisma 7 does not auto-load .env; the seed runs as its own process.
loadEnv({ path: ['.env.local', '.env'] });

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // Idempotent reset of the pricing baseline. The deletes run in one
    // transaction in FK-dependency order. No scenarios or calculation results
    // exist in this phase, so the pricing tables are the only owners.
    // Scenario-aware reseeding is a later concern (see open-questions).
    await prisma.$transaction([
      prisma.pricingCatalog.deleteMany(),
      prisma.benchmarkResult.deleteMany(),
      prisma.pricingSnapshot.deleteMany(),
      prisma.sourceReference.deleteMany(),
    ]);

    const createdSources = await Promise.all(
      citedSources.map(async (source) => {
        const created = await prisma.sourceReference.create({
          data: {
            sourceType: source.sourceType,
            title: source.title,
            url: source.url,
            provider: source.provider,
            sourceDate: source.sourceDate ? new Date(source.sourceDate) : null,
            retrievedAt: new Date(source.retrievedAt),
            notes: source.notes ?? null,
          },
        });
        return [source.key, created.id] as const;
      })
    );
    const sourceIdByKey = new Map(createdSources);

    const snapshot = await prisma.pricingSnapshot.create({
      data: {
        name: pricingSnapshot.name,
        currency: pricingSnapshot.currency,
        status: pricingSnapshot.status,
        freshnessState: pricingSnapshot.freshnessState,
        capturedAt: new Date(pricingSnapshot.capturedAt),
        notes: pricingSnapshot.notes,
      },
    });

    await Promise.all(
      pricingCatalog.map((entry) => {
        const sourceReferenceId = sourceIdByKey.get(entry.sourceKey);
        if (!sourceReferenceId) {
          throw new Error(
            `Catalog row ${entry.provider}/${entry.model} references unknown source ${entry.sourceKey}`
          );
        }

        return prisma.pricingCatalog.create({
          data: {
            pricingSnapshotId: snapshot.id,
            sourceReferenceId,
            provider: entry.provider,
            model: entry.model,
            capability: entry.capability,
            contextWindowTokens: entry.contextWindowTokens ?? null,
            currency: entry.currency,
            priceUnit: entry.priceUnit,
            inputPrice: entry.inputPrice ?? null,
            outputPrice: entry.outputPrice ?? null,
            cachedInputReadPrice: entry.cachedInputReadPrice ?? null,
            cacheWritePrice: entry.cacheWritePrice ?? null,
            embeddingPrice: entry.embeddingPrice ?? null,
            notes: entry.notes ?? null,
          },
        });
      })
    );

    console.warn(
      `Seeded ${citedSources.length} cited sources and ${pricingCatalog.length} pricing rows into snapshot "${snapshot.name}".`
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
