import { ChatCostCalculator } from '@/components/chat/chat-cost-calculator';
import { DEFAULT_CHAT_INPUTS } from '@/components/chat/chat-inputs';
import { SavedScenarios } from '@/components/chat/saved-scenarios';
import { computeChatCost } from '@/lib/calc/chat-cost';
import { getActiveSnapshot, listCatalog } from '@/lib/data/pricing-repository';

import type { ChatModelOption } from '@/components/chat/chat-cost-calculator';
import type { ChatCostResult } from '@/lib/calc/chat-cost';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat Cost',
  description: 'Estimate chat token cost with prompt caching, interaction volume, and rollups.',
};

export default async function ChatCostPage() {
  const snapshot = await getActiveSnapshot();
  const catalog = snapshot ? await listCatalog(snapshot.id) : [];
  const chatRows = catalog.filter(
    (row) => row.capability === 'chat' && row.inputPrice && row.outputPrice
  );
  const models: ChatModelOption[] = chatRows.map((row) => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
  }));

  const first = chatRows[0];
  let defaultResult: ChatCostResult | null = null;
  if (first?.inputPrice && first.outputPrice) {
    defaultResult = computeChatCost(DEFAULT_CHAT_INPUTS, {
      provider: first.provider,
      model: first.model,
      currency: first.currency,
      inputPrice: first.inputPrice,
      outputPrice: first.outputPrice,
      cachedInputReadPrice: first.cachedInputReadPrice,
      cacheWritePrice: first.cacheWritePrice,
    });
  }

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Chat cost playground
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Model chat token cost
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Estimate request and session cost from token buckets, interaction volume, and prompt
          caching. Calculations run on the backend against the active pricing snapshot.
        </p>
      </header>

      {models.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          No chat pricing is available in the active snapshot.
        </div>
      ) : (
        <ChatCostCalculator models={models} defaultResult={defaultResult} />
      )}

      <SavedScenarios />
    </div>
  );
}
