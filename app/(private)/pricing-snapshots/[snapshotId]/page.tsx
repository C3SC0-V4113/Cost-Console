import { notFound } from 'next/navigation';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { getCurrentUser } from '@/lib/auth';
import { getPricingSnapshotFixtureById } from '@/lib/pricing-snapshot-fixtures';
import { canManagePricingSnapshots } from '@/lib/roles';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing snapshot detail',
  description: 'Admin-only pricing snapshot detail surface.',
};

async function PricingSnapshotDetailContent({
  snapshotId,
}: Readonly<{
  snapshotId: string;
}>) {
  const snapshot = getPricingSnapshotFixtureById(snapshotId);

  if (!snapshot) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Snapshot detail
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
          {snapshot.name}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{snapshot.notes}</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.status}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Currency</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.currency}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Freshness</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.freshnessState}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Captured at</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.capturedAtLabel}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Valid from</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.validFromLabel}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-sm text-muted-foreground">Source summary</p>
          <p className="mt-1 font-medium text-foreground">{snapshot.sourceSummary}</p>
        </div>
      </section>
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
