# ADR 0009: Source Text-to-SQL Accuracy From Cited Benchmarks

- Date: 2026-06-20
- Status: Accepted

## Context

ADR 0004 documented the Text-to-SQL Cost Lab and listed accuracy as a future
implementation choice ("accuracy as a benchmark- or scenario-specific metric, not
a universal model property"). The first implementation shipped accuracy as two
free numeric inputs (baseline and semantic-layer percentages) marked as a "manual
estimate".

That was wrong on substance. Text-to-SQL accuracy is an empirical measurement: a
given model achieves a measured execution accuracy **on a specific benchmark
dataset**, with and without a semantic layer (BIRD, Spider, and the paired
semantic-layer studies from dbt Labs and Cube). Letting the user type accuracy
invites invented numbers, which ADR 0006 (curated, cited, source-backed values)
forbids.

A complication surfaced: the pricing catalog seeds _simulated_ future models
(`gpt-5.5`, `claude-opus-4-5`) for forward-looking cost modeling, while published
benchmark accuracy exists only for _real_ benchmarked models
(`gpt-5.3-codex`, `claude-sonnet-4-6`, `gpt-5.4`). The two cannot share one
selector without fabricating a benchmark score for a model that was never
benchmarked.

## Decision Drivers

- Accuracy must be a source-backed result, not a user input (ADR 0006).
- Each benchmark is tied to a specific database/dataset, which is the reference
  point for its accuracy figures (ADR 0003 and ADR 0004).
- Cost modeling must keep using the simulated pricing catalog.
- The UI must not invent or blend numbers; provenance must be visible.
- Reuse the existing `benchmark_result` schema and the `SourceTag` traceability
  affordance rather than adding new structures.

## Decision

Text-to-SQL accuracy is **resolved from seeded `benchmark_result` rows**, never
typed by the user.

- Seed paired benchmarks in `prisma/seed-data.ts` (`textToSqlBenchmarks`): each
  entry expands to two `benchmark_result` rows — `text_to_sql_accuracy`
  (baseline) and `semantic_layer_accuracy` (with the layer) — sharing dataset,
  model, and a cited `source_reference`. Initial data: dbt Labs (official) and
  Cube (vendor) 2026 paired studies.
- `lib/data/benchmark-repository.ts` pairs the two rows back into one scenario by
  dataset + model, emitting a scenario only when both halves exist.
- Cost and accuracy use **two independent selectors**: cost from the catalog
  pricing model, accuracy from a benchmark + benchmarked (real) model. The
  summary states both sources and shows the accuracy source with `SourceTag` and
  an official/vendor badge.
- The calc engine stays pure: it receives the resolved accuracy numbers; the
  server action looks them up from the benchmark and re-derives cost so the UI
  holds neither.

Benchmark model names are intentionally decoupled from the catalog and are not to
be reconciled with it.

## Consequences

### Positive

- Accuracy is traceable to a cited study, consistent with ADR 0006.
- The three-way scenario comparison (raw, semantic, semantic + retry) is driven
  by measured figures instead of guesses.
- Cost stays forward-looking on the simulated catalog without contaminating the
  accuracy provenance.
- Adding benchmarks is data-only: append a cited entry to `textToSqlBenchmarks`.

### Negative

- Coverage is limited to seeded model/benchmark pairs; an arbitrary catalog model
  has no accuracy of its own.
- Two selectors are more to explain than one; mitigated by an inline note that
  cost and accuracy are independent.
- A user override for domain-mismatched benchmarks (allowed by ADR 0004) is not
  yet implemented and remains deferred, as do raw-only references (BIRD, Spider).

## Related Decisions

- ADR 0004 defined the Text-to-SQL Cost Lab; this ADR implements and refines its
  accuracy model.
- ADR 0006 sets the curated, cited source policy this ADR applies to accuracy.
- ADR 0003 established that benchmarks are tied to specific datasets.

## References

- [dbt Labs: Semantic Layer vs. Text-to-SQL 2026 benchmark](https://docs.getdbt.com/blog/semantic-layer-vs-text-to-sql-2026)
- [Cube: paired semantic-layer benchmark across three frontier models](https://cube.dev/blog/why-semantic-layers-make-llm-analytics-reliable-a-paired-benchmark-across-three-frontier-models)
- [BIRD-bench leaderboard](https://bird-bench.github.io/)
- `docs/product/views.md` — Text-to-SQL Cost Lab view contract
