import 'server-only';

import { prisma } from '@/lib/prisma';

import type { PricingSourceDTO, RagRetrievalBenchmarkDTO, TextToSqlBenchmarkDTO } from './dto';

// Structural row shape the mapper reads, kept independent of generated Prisma
// types so the pairing logic stays pure and testable.
type DecimalLike = { toString(): string };

type SourceRow = {
  title: string;
  url: string;
  sourceType: string;
  sourceDate: Date | null;
  retrievedAt: Date;
};

type BenchmarkRow = {
  benchmarkKind: string;
  provider: string | null;
  model: string | null;
  datasetOrScenario: string | null;
  metricType: string;
  metricValue: DecimalLike;
  isOfficial: boolean;
  notes: string | null;
  sourceReference: SourceRow | null;
};

function toSourceDTO(source: SourceRow | null): PricingSourceDTO | null {
  if (!source) {
    return null;
  }
  return {
    title: source.title,
    url: source.url,
    sourceType: source.sourceType,
    sourceDate: source.sourceDate ? source.sourceDate.toISOString() : null,
    retrievedAt: source.retrievedAt.toISOString(),
  };
}

// Pairs the two rows that make up a benchmark scenario — the baseline
// (text_to_sql_accuracy) and the semantic-layer result (semantic_layer_accuracy)
// — into one DTO keyed by dataset + model. A scenario is only emitted when both
// halves exist, so the lab never shows a half-sourced accuracy.
export function toTextToSqlBenchmarks(rows: BenchmarkRow[]): TextToSqlBenchmarkDTO[] {
  const byKey = new Map<string, { baseline?: BenchmarkRow; semantic?: BenchmarkRow }>();

  for (const row of rows) {
    if (!row.provider || !row.model || !row.datasetOrScenario) {
      continue;
    }
    const key = `${row.datasetOrScenario}::${row.provider}::${row.model}`;
    const pair = byKey.get(key) ?? {};
    if (row.benchmarkKind === 'text_to_sql_accuracy') {
      pair.baseline = row;
    } else if (row.benchmarkKind === 'semantic_layer_accuracy') {
      pair.semantic = row;
    }
    byKey.set(key, pair);
  }

  const scenarios: TextToSqlBenchmarkDTO[] = [];
  for (const [id, pair] of byKey) {
    // A baseline (text_to_sql_accuracy) is required; the semantic-layer figure
    // is optional so raw-only benchmarks (BIRD, Spider) still appear.
    if (!pair.baseline) {
      continue;
    }
    const { baseline, semantic } = pair;
    scenarios.push({
      id,
      benchmark: baseline.datasetOrScenario ?? '',
      provider: baseline.provider ?? '',
      model: baseline.model ?? '',
      metricType: baseline.metricType,
      isOfficial: baseline.isOfficial,
      baselineAccuracy: baseline.metricValue.toString(),
      semanticAccuracy: semantic ? semantic.metricValue.toString() : null,
      notes: baseline.notes,
      source: toSourceDTO(baseline.sourceReference),
    });
  }

  return scenarios;
}

export async function listTextToSqlBenchmarks(): Promise<TextToSqlBenchmarkDTO[]> {
  const rows = await prisma.benchmarkResult.findMany({
    where: { benchmarkKind: { in: ['text_to_sql_accuracy', 'semantic_layer_accuracy'] } },
    include: { sourceReference: true },
    orderBy: [{ datasetOrScenario: 'asc' }, { provider: 'asc' }, { model: 'asc' }],
  });
  return toTextToSqlBenchmarks(rows);
}

// One cited retrieval-quality score per embedding model (MTEB). Keyed by model
// name so the RAG lab can attach it to the selected embedding.
export function toRagRetrievalBenchmarks(rows: BenchmarkRow[]): RagRetrievalBenchmarkDTO[] {
  const benchmarks: RagRetrievalBenchmarkDTO[] = [];
  for (const row of rows) {
    if (!row.provider || !row.model || !row.datasetOrScenario) {
      continue;
    }
    benchmarks.push({
      benchmark: row.datasetOrScenario,
      provider: row.provider,
      model: row.model,
      metricType: row.metricType,
      metricValue: row.metricValue.toString(),
      notes: row.notes,
      source: toSourceDTO(row.sourceReference),
    });
  }
  return benchmarks;
}

export async function listRagRetrievalBenchmarks(): Promise<RagRetrievalBenchmarkDTO[]> {
  const rows = await prisma.benchmarkResult.findMany({
    where: { benchmarkKind: 'rag_retrieval' },
    include: { sourceReference: true },
    orderBy: [{ provider: 'asc' }, { model: 'asc' }],
  });
  return toRagRetrievalBenchmarks(rows);
}
