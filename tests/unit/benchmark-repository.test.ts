import { describe, expect, it } from 'vitest';

import { toRagRetrievalBenchmarks, toTextToSqlBenchmarks } from '@/lib/data/benchmark-repository';

type Row = Parameters<typeof toTextToSqlBenchmarks>[0][number];

const source = {
  title: 'dbt Semantic Layer benchmark',
  url: 'https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026',
  sourceType: 'vendor_benchmark',
  sourceDate: new Date('2026-04-07T00:00:00.000Z'),
  retrievedAt: new Date('2026-06-19T00:00:00.000Z'),
};

function row(overrides: Partial<Row>): Row {
  return {
    benchmarkKind: 'text_to_sql_accuracy',
    provider: 'OpenAI',
    model: 'gpt-5.3-codex',
    datasetOrScenario: 'dbt Semantic Layer · ACME Insurance',
    metricType: 'execution_accuracy',
    metricValue: '84.1',
    isOfficial: true,
    notes: null,
    sourceReference: source,
    ...overrides,
  };
}

describe('toTextToSqlBenchmarks', () => {
  it('pairs the baseline and semantic rows into one cited scenario', () => {
    const scenarios = toTextToSqlBenchmarks([
      row({ benchmarkKind: 'text_to_sql_accuracy', metricValue: '84.1' }),
      row({ benchmarkKind: 'semantic_layer_accuracy', metricValue: '100.0' }),
    ]);

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]).toMatchObject({
      id: 'dbt Semantic Layer · ACME Insurance::OpenAI::gpt-5.3-codex',
      benchmark: 'dbt Semantic Layer · ACME Insurance',
      provider: 'OpenAI',
      model: 'gpt-5.3-codex',
      baselineAccuracy: '84.1',
      semanticAccuracy: '100.0',
      isOfficial: true,
    });
    expect(scenarios[0]?.source?.url).toContain('getdbt.com');
    expect(scenarios[0]?.source?.retrievedAt).toBe('2026-06-19T00:00:00.000Z');
  });

  it('emits a raw-only scenario when only the baseline half exists', () => {
    const scenarios = toTextToSqlBenchmarks([
      row({ benchmarkKind: 'text_to_sql_accuracy', metricValue: '52.5' }),
    ]);

    expect(scenarios).toHaveLength(1);
    expect(scenarios[0]?.baselineAccuracy).toBe('52.5');
    expect(scenarios[0]?.semanticAccuracy).toBeNull();
  });

  it('omits a scenario that has only a semantic half and no baseline', () => {
    const scenarios = toTextToSqlBenchmarks([
      row({ benchmarkKind: 'semantic_layer_accuracy', metricValue: '68' }),
    ]);

    expect(scenarios).toHaveLength(0);
  });

  it('keeps separate datasets and models as distinct scenarios', () => {
    const scenarios = toTextToSqlBenchmarks([
      row({ benchmarkKind: 'text_to_sql_accuracy', metricValue: '84.1' }),
      row({ benchmarkKind: 'semantic_layer_accuracy', metricValue: '100.0' }),
      row({
        benchmarkKind: 'text_to_sql_accuracy',
        provider: 'Anthropic',
        model: 'claude-sonnet-4-6',
        metricValue: '90.0',
      }),
      row({
        benchmarkKind: 'semantic_layer_accuracy',
        provider: 'Anthropic',
        model: 'claude-sonnet-4-6',
        metricValue: '98.2',
      }),
    ]);

    expect(scenarios).toHaveLength(2);
  });

  it('skips rows without a provider, model, or dataset', () => {
    const scenarios = toTextToSqlBenchmarks([
      row({ benchmarkKind: 'text_to_sql_accuracy', model: null }),
      row({ benchmarkKind: 'semantic_layer_accuracy', model: null }),
    ]);

    expect(scenarios).toHaveLength(0);
  });
});

describe('toRagRetrievalBenchmarks', () => {
  it('maps each rag_retrieval row to a per-model DTO with its source', () => {
    const benchmarks = toRagRetrievalBenchmarks([
      row({
        benchmarkKind: 'rag_retrieval',
        datasetOrScenario: 'MTEB v2 · English',
        provider: 'OpenAI',
        model: 'text-embedding-3-large',
        metricType: 'mteb_mean',
        metricValue: '64.6',
      }),
    ]);

    expect(benchmarks).toHaveLength(1);
    expect(benchmarks[0]).toMatchObject({
      benchmark: 'MTEB v2 · English',
      model: 'text-embedding-3-large',
      metricValue: '64.6',
    });
    expect(benchmarks[0]?.source?.url).toMatch(/^https:\/\//);
  });

  it('skips rows missing a provider, model, or dataset', () => {
    expect(
      toRagRetrievalBenchmarks([row({ benchmarkKind: 'rag_retrieval', model: null })])
    ).toHaveLength(0);
  });
});
