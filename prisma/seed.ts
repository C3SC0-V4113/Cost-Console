import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { Pool } from 'pg';

import { citedSources, pricingCatalog, pricingSnapshot, textToSqlBenchmarks } from './seed-data';
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

    // Catalog rows and benchmark rows both depend only on the snapshot and the
    // sources, not on each other, so they are created in one parallel batch.
    const catalogCreates = pricingCatalog.map((entry) => {
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
    });

    // Each paired benchmark becomes two rows: the baseline (text_to_sql_accuracy)
    // and the semantic-layer result (semantic_layer_accuracy), sharing dataset,
    // model, and cited source so the lab can pair them back into one scenario.
    const benchmarkCreates = textToSqlBenchmarks.flatMap((entry) => {
      const sourceReferenceId = sourceIdByKey.get(entry.sourceKey);
      if (!sourceReferenceId) {
        throw new Error(
          `Benchmark ${entry.benchmark}/${entry.model} references unknown source ${entry.sourceKey}`
        );
      }

      const base = {
        sourceReferenceId,
        provider: entry.provider,
        model: entry.model,
        datasetOrScenario: entry.benchmark,
        metricType: entry.metricType,
        metricUnit: 'percent',
        isOfficial: entry.isOfficial,
        notes: entry.notes ?? null,
      };

      const rows = [
        prisma.benchmarkResult.create({
          data: {
            ...base,
            benchmarkKind: 'text_to_sql_accuracy',
            metricValue: entry.baselineAccuracy,
          },
        }),
      ];
      // Raw-only benchmarks (BIRD, Spider) report no semantic-layer figure.
      if (entry.semanticAccuracy !== undefined) {
        rows.push(
          prisma.benchmarkResult.create({
            data: {
              ...base,
              benchmarkKind: 'semantic_layer_accuracy',
              metricValue: entry.semanticAccuracy,
            },
          })
        );
      }
      return rows;
    });

    await Promise.all([...catalogCreates, ...benchmarkCreates]);

    console.warn(
      `Seeded ${citedSources.length} cited sources, ${pricingCatalog.length} pricing rows, and ${textToSqlBenchmarks.length} text-to-sql benchmarks into snapshot "${snapshot.name}".`
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
