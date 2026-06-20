import { getTranslations } from 'next-intl/server';

import { TextToSqlCostCalculator } from '@/components/text-to-sql/text-to-sql-cost-calculator';
import { DEFAULT_TEXT_TO_SQL_INPUTS } from '@/components/text-to-sql/text-to-sql-inputs';
import { computeTextToSqlCost } from '@/lib/calc/text-to-sql-cost';
import { listTextToSqlBenchmarks } from '@/lib/data/benchmark-repository';
import { getActiveSnapshot, listCatalog } from '@/lib/data/pricing-repository';

import type { TextToSqlModelOption } from '@/components/text-to-sql/text-to-sql-cost-calculator';
import type { TextToSqlCostResult } from '@/lib/calc/text-to-sql-cost';
import type { TextToSqlBenchmarkDTO } from '@/lib/data/dto';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('textToSql');

  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function TextToSqlCostPage() {
  const [t, snapshot, benchmarks] = await Promise.all([
    getTranslations('textToSql'),
    getActiveSnapshot(),
    listTextToSqlBenchmarks(),
  ]);
  const catalog = snapshot ? await listCatalog(snapshot.id) : [];
  const chatRows = catalog.filter(
    (row) => row.capability === 'chat' && row.inputPrice && row.outputPrice
  );

  const models: TextToSqlModelOption[] = chatRows.map((row) => ({
    id: row.id,
    provider: row.provider,
    model: row.model,
  }));

  const first = chatRows[0];
  const firstBenchmark: TextToSqlBenchmarkDTO | null = benchmarks[0] ?? null;
  let defaultResult: TextToSqlCostResult | null = null;
  if (first?.inputPrice && first.outputPrice && firstBenchmark) {
    defaultResult = computeTextToSqlCost(
      {
        ...DEFAULT_TEXT_TO_SQL_INPUTS,
        includeSemantic: true,
        baselineAccuracyPercentage: Number(firstBenchmark.baselineAccuracy),
        semanticAccuracyPercentage: Number(firstBenchmark.semanticAccuracy),
      },
      {
        currency: first.currency,
        generation: {
          provider: first.provider,
          model: first.model,
          inputPrice: first.inputPrice,
          outputPrice: first.outputPrice,
          cachedInputReadPrice: first.cachedInputReadPrice,
        },
        warehousePricePerThousandQueries: null,
      }
    );
  }

  const isReady = models.length > 0 && benchmarks.length > 0;

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

      {isReady ? (
        <TextToSqlCostCalculator
          models={models}
          benchmarks={benchmarks}
          defaultResult={defaultResult}
          defaultBenchmark={firstBenchmark}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          {t('noPricing')}
        </div>
      )}
    </div>
  );
}
