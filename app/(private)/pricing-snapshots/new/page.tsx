import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentUser } from '@/lib/auth';
import { canManagePricingSnapshots } from '@/lib/roles';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prepare pricing snapshot',
  description: 'Admin-only pricing snapshot creation scaffold.',
};

function NewPricingSnapshotContent() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Admin surface
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
          Prepare a pricing snapshot
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          The creation workflow is intentionally visible only to admins. The final save path remains
          blocked until the PostgreSQL-backed pricing catalog API is implemented, so this screen
          currently captures the intended contract instead of persisting data.
        </p>
      </section>

      <section className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-2">
          <label htmlFor="snapshot-name" className="text-sm font-medium text-foreground">
            Snapshot name
          </label>
          <Input id="snapshot-name" placeholder="2026-06 official pricing refresh" disabled />
        </div>
        <div className="grid gap-2">
          <label htmlFor="snapshot-currency" className="text-sm font-medium text-foreground">
            Currency
          </label>
          <Input id="snapshot-currency" placeholder="USD" disabled />
        </div>
        <div className="grid gap-2">
          <label htmlFor="snapshot-notes" className="text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            id="snapshot-notes"
            className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Summarize the source pages, retrieval dates, and manual assumptions."
            disabled
          />
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          Saving is intentionally disabled until the pricing snapshot persistence API exists. The
          admin-only route and future field contract are implemented now so the eventual backend can
          plug into a stable UI surface.
        </div>

        <div className="flex justify-end">
          <Button disabled>Snapshot persistence pending backend</Button>
        </div>
      </section>
    </div>
  );
}

export default async function NewPricingSnapshotPage() {
  const user = await getCurrentUser();
  return user && canManagePricingSnapshots(user) ? (
    <NewPricingSnapshotContent />
  ) : (
    <AccessDeniedPanel />
  );
}
