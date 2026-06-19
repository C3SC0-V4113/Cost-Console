import { getTranslations } from 'next-intl/server';

import { RagCostCalculator } from '@/components/rag/rag-cost-calculator';
import { DEFAULT_RAG_INPUTS } from '@/components/rag/rag-inputs';
import { computeRagCost } from '@/lib/calc/rag-cost';
import { getActiveSnapshot, listCatalog } from '@/lib/data/pricing-repository';

import type { RagModelOption } from '@/components/rag/rag-cost-calculator';
import type { RagCostResult } from '@/lib/calc/rag-cost';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('rag');

  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function RagCostPage() {
  const [t, snapshot] = await Promise.all([getTranslations('rag'), getActiveSnapshot()]);
  const catalog = snapshot ? await listCatalog(snapshot.id) : [];

  const embeddingRows = catalog.filter(
    (row) => row.capability === 'embedding' && row.embeddingPrice
  );
  const chatRows = catalog.filter(
    (row) => row.capability === 'chat' && row.inputPrice && row.outputPrice
  );

  const embeddingModels: RagModelOption[] = embeddingRows.map((row) => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
  }));
  const generationModels: RagModelOption[] = chatRows.map((row) => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
  }));

  const firstEmbedding = embeddingRows[0];
  const firstChat = chatRows[0];
  let defaultResult: RagCostResult | null = null;
  if (firstEmbedding?.embeddingPrice && firstChat?.inputPrice && firstChat.outputPrice) {
    defaultResult = computeRagCost(DEFAULT_RAG_INPUTS, {
      currency: firstChat.currency,
      ingestionEmbedding: {
        provider: firstEmbedding.provider,
        model: firstEmbedding.model,
        embeddingPrice: firstEmbedding.embeddingPrice,
      },
      queryEmbedding: {
        provider: firstEmbedding.provider,
        model: firstEmbedding.model,
        embeddingPrice: firstEmbedding.embeddingPrice,
      },
      generation: {
        provider: firstChat.provider,
        model: firstChat.model,
        inputPrice: firstChat.inputPrice,
        outputPrice: firstChat.outputPrice,
        cachedInputReadPrice: firstChat.cachedInputReadPrice,
        cacheWritePrice: firstChat.cacheWritePrice,
      },
      storagePricePerMillionVectorsPerMonth: null,
    });
  }

  const hasModels = embeddingModels.length > 0 && generationModels.length > 0;

  return (
    <div className="grid gap-6">
      <header className="grid gap-1">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{t('description')}</p>
      </header>

      {hasModels ? (
        <RagCostCalculator
          embeddingModels={embeddingModels}
          generationModels={generationModels}
          defaultResult={defaultResult}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          {t('noPricing')}
        </div>
      )}
    </div>
  );
}
