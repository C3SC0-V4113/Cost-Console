import { notFound } from 'next/navigation';
import { getFormatter, getTranslations } from 'next-intl/server';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { PricingCatalogTable } from '@/components/pricing/pricing-catalog-table';
import { getCurrentUser } from '@/lib/auth';
import { getSnapshotById, listCatalog } from '@/lib/data/pricing-repository';
import { canManagePricingSnapshots } from '@/lib/roles';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing.detail');

  return { title: t('metaTitle'), description: t('metaDescription') };
}

async function PricingSnapshotDetailContent({
  snapshotId,
}: Readonly<{
  snapshotId: string;
}>) {
  const [t, format, snapshot, catalog] = await Promise.all([
    getTranslations('pricing'),
    getFormatter(),
    getSnapshotById(snapshotId),
    listCatalog(snapshotId),
  ]);

  if (!snapshot) {
    notFound();
  }

  const formatSnapshotDate = (iso: string | null): string => {
    if (!iso) {
      return t('detail.noValue');
    }
    return format.dateTime(new Date(iso), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const facts = [
    { key: 'status', label: t('detail.status'), value: t(`status.${snapshot.status}`) },
    { key: 'currency', label: t('detail.currency'), value: snapshot.currency },
    {
      key: 'freshness',
      label: t('detail.freshness'),
      value: t(`freshness.${snapshot.freshnessState}`),
    },
    {
      key: 'capturedAt',
      label: t('detail.capturedAt'),
      value: formatSnapshotDate(snapshot.capturedAt),
    },
    {
      key: 'validFrom',
      label: t('detail.validFrom'),
      value: formatSnapshotDate(snapshot.validFrom),
    },
    {
      key: 'coverage',
      label: t('detail.coverage'),
      value: t('detail.coverageValue', { count: catalog.length }),
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {t('detail.eyebrow')}
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
          {snapshot.name}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{snapshot.notes}</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.key} className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">{fact.label}</p>
            <p className="mt-1 font-medium text-foreground">{fact.value}</p>
          </div>
        ))}
      </section>

      <PricingCatalogTable rows={catalog} currency={snapshot.currency} />
    </div>
  );
}

export default async function PricingSnapshotDetailPage({
  params,
}: {
  params: Promise<{ snapshotId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !canManagePricingSnapshots(user)) {
    return <AccessDeniedPanel />;
  }

  const { snapshotId } = await params;

  return <PricingSnapshotDetailContent snapshotId={snapshotId} />;
}
