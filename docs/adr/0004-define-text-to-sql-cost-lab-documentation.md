# ADR 0004: Define Text-to-SQL Cost Lab Documentation

- Date: 2026-06-03
- Status: Accepted

## Context

Cost Console already documents planned cost surfaces for chat, pricing, RAG, and
embedding/vector query workflows. A third AI cost scenario is needed for
Text-to-SQL: natural-language analytics questions that generate SQL directly or
through a semantic layer.

The user provided references about semantic layers, Text-to-SQL accuracy, the
BIRD benchmark, and dbt semantic-layer benchmarks. These sources show that
accuracy depends on benchmark methodology, data model shape, semantic-layer
coverage, model choice, and whether additional modeling resolves questions that
are otherwise not answerable.

The product needs to document this scenario without implementing routes,
components, APIs, database schemas, TypeScript types, dependencies, tests,
calculation helpers, or benchmark presets yet.

## Decision Drivers

- Keep this phase strictly documentation-only.
- Compare raw Text-to-SQL against semantic-layer-assisted Text-to-SQL.
- Make semantic-layer token overhead visible.
- Treat accuracy as benchmark- and scenario-dependent.
- Allow benchmark presets and user overrides without mixing them silently.
- Keep warehouse/database execution cost optional and source-backed.

## Decision

Cost Console will document one planned `Text-to-SQL Cost Lab` surface in
`docs/product/views.md`.

The documented view covers:

- model and pricing selection;
- schema/context setup;
- semantic-layer mode;
- workload volume;
- SQL generation and validation loop;
- benchmark and accuracy source;
- optional warehouse execution cost;
- cost and accuracy summary.

Accuracy can come from benchmark presets plus documented user override. Presets
may reference sources such as dbt semantic-layer benchmarks, BIRD, Denodo-style
semantic-layer examples, or custom/manual scenarios. User overrides must carry
notes and should be visually distinct from source-backed benchmark values.

Warehouse/database execution cost is optional. If no source-backed value exists,
the future UI should still calculate LLM token cost and label execution cost as
unavailable instead of inventing a value.

This ADR is documentation-only. It does not authorize runtime implementation,
routes, components, APIs, database schemas, TypeScript types, dependencies,
calculation helpers, tests, benchmark ingestion, or persistence.

## Consequences

### Positive

- The product documentation now covers a third AI cost scenario beyond chat and
  RAG.
- Future implementers have a clear distinction between token cost, semantic-layer
  overhead, validation/retry cost, optional warehouse execution cost, and
  accuracy.
- Accuracy is treated with proper benchmark/source context.
- The view can explain the tradeoff that semantic layers may cost more tokens
  while improving correctness or making failures explicit.

### Negative

- Exact benchmark values, benchmark ingestion rules, and dataset matching remain
  future decisions.
- The view may become dense if it tries to compare too many semantic-layer
  patterns at once.
- Warehouse execution cost varies by provider and may often remain unavailable
  without source-backed assumptions.

## Related Decisions

- ADR 0001 defines the Cost Console product boundary.
- ADR 0002 defines the initial view model documentation.
- ADR 0003 defines the RAG Cost Lab documentation.
- `docs/product/views.md` contains the Text-to-SQL Cost Lab view contract.

## References

- [dbt LLM Semantic Layer Benchmark](https://dbt-labs.github.io/dbt-llm-sl-bench/)
- [dbt benchmark compare](https://dbt-labs.github.io/dbt-llm-sl-bench/compare/)
- [dbt repeated runs](https://dbt-labs.github.io/dbt-llm-sl-bench/repeated-runs/)
- [dbt historical results](https://dbt-labs.github.io/dbt-llm-sl-bench/historical/)
- [BIRD benchmark](https://bird-bench.github.io/)
- [BIRD paper](https://arxiv.org/abs/2305.03111)
- [Denodo semantic-layer Text-to-SQL article](https://www.datamanagementblog.com/improving-the-accuracy-of-llm-based-text-to-sql-generation-with-a-semantic-layer-in-the-denodo-platform/)
