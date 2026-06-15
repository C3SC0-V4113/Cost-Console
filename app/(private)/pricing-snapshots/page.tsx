import Link from 'next/link';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { listSnapshots } from '@/lib/data/pricing-repository';
import { formatDate } from '@/lib/format';
import { canManagePricingSnapshots } from '@/lib/roles';

import type { PricingSnapshotDTO } from '@/lib/data/dto';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing snapshots',
  description: 'Admin-only pricing snapshot surface for Cost Console.',
};

function PricingSnapshotsContent({ snapshots }: Readonly<{ snapshots: PricingSnapshotDTO[] }>) {
  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Admin surface
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
            Pricing snapshots
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            This shell is restricted to project admins. Snapshot persistence is still pending the
            future pricing catalog backend, but listing and drill-down access are already reserved
            behind admin-only navigation and API guards.
          </p>
        </div>
        <Button asChild>
          <Link href="/pricing-snapshots/new">Prepare snapshot</Link>
        </Button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] gap-4 border-b border-border px-6 py-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase md:grid">
          <span>Name</span>
          <span>Status</span>
          <span>Currency</span>
          <span>Freshness</span>
          <span>Captured</span>
        </div>
        <div className="divide-y divide-border">
          {snapshots.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No pricing snapshots have been captured yet.
            </p>
          ) : (
            snapshots.map((snapshot) => (
              <Link
                key={snapshot.id}
                href={`/pricing-snapshots/${snapshot.id}`}
                className="flex flex-col gap-2 px-6 py-4 text-sm transition-colors hover:bg-muted/40 md:grid md:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] md:items-center md:gap-4"
              >
                <div className="grid gap-1">
                  <span className="font-medium text-foreground">{snapshot.name}</span>
                  <span className="text-muted-foreground">{snapshot.notes}</span>
                </div>
                <span className="text-foreground">
                  <span className="text-muted-foreground md:hidden">Status: </span>
                  {snapshot.status}
                </span>
                <span className="text-foreground">
                  <span className="text-muted-foreground md:hidden">Currency: </span>
                  {snapshot.currency}
                </span>
                <span className="text-foreground">
                  <span className="text-muted-foreground md:hidden">Freshness: </span>
                  {snapshot.freshnessState}
                </span>
                <span className="text-foreground">
                  <span className="text-muted-foreground md:hidden">Captured: </span>
                  {formatDate(snapshot.capturedAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default async function PricingSnapshotsPage() {
  const user = await getCurrentUser();
  if (!user || !canManagePricingSnapshots(user)) {
    return <AccessDeniedPanel />;
  }

  const snapshots = await listSnapshots();

  return <PricingSnapshotsContent snapshots={snapshots} />;
}
