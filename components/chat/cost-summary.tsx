import { formatCurrency } from '@/lib/format';

import type { ChatCostResult } from '@/lib/calc/chat-cost';

const ROLLUPS = [
  { key: 'costPerInteraction', label: 'Per interaction' },
  { key: 'dailyCost', label: 'Per day' },
  { key: 'monthlyCost', label: 'Per month' },
  { key: 'yearlyCost', label: 'Per year' },
] as const;

function Assumption({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export function CostSummary({ result }: Readonly<{ result: ChatCostResult | null }>) {
  if (!result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Select a model to see the cost estimate.
      </div>
    );
  }

  const { currency } = result;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLLUPS.map((rollup) => (
          <div key={rollup.key} className="grid gap-1 rounded-md bg-muted p-4">
            <span className="text-xs text-muted-foreground">{rollup.label}</span>
            <span className="text-xl font-semibold text-foreground tabular-nums">
              {formatCurrency(result[rollup.key], currency)}
            </span>
          </div>
        ))}
      </div>

      {result.cacheAvailable ? null : (
        <p className="text-xs text-muted-foreground">
          {result.provider} does not publish cache pricing for {result.model}; cache tokens are
          billed as regular input.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[1.5fr_repeat(3,1fr)] gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid">
          <span>Line item</span>
          <span className="text-right">Tokens</span>
          <span className="text-right">Unit price</span>
          <span className="text-right">Cost / interaction</span>
        </div>
        <div className="divide-y divide-border">
          {result.lineItems.map((item) => (
            <div
              key={item.category}
              className="flex flex-col gap-1 px-4 py-3 text-sm sm:grid sm:grid-cols-[1.5fr_repeat(3,1fr)] sm:items-center sm:gap-4"
            >
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground sm:text-right">
                <span className="sm:hidden">Tokens: </span>
                {item.tokensPerInteraction}
              </span>
              <span className="text-muted-foreground sm:text-right">
                <span className="sm:hidden">Unit: </span>
                {formatCurrency(item.unitPrice, currency)}/1M
              </span>
              <span className="font-medium text-foreground sm:text-right">
                <span className="font-normal text-muted-foreground sm:hidden">Cost: </span>
                {formatCurrency(item.costPerInteraction, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
        <Assumption label="Provider" value={result.assumptions.provider} />
        <Assumption label="Model" value={result.assumptions.model} />
        <Assumption label="Currency" value={result.assumptions.currency} />
        <Assumption
          label="Interactions / day"
          value={String(result.assumptions.interactionsPerDay)}
        />
        <Assumption label="Days / month" value={String(result.assumptions.daysPerMonth)} />
        <Assumption label="Cache hit %" value={`${result.assumptions.promptCacheHitPercentage}%`} />
      </dl>
    </div>
  );
}
