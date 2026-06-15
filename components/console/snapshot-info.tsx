'use client';

import { WalletCards } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate } from '@/lib/format';

import type { PricingSnapshotDTO } from '@/lib/data/dto';

// Compact, accessible access to the active pricing snapshot metadata. Replaces a
// header text block that overflowed and was hidden on mobile: an icon button on
// every screen opens a popover with the snapshot details (ADR 0007: normal users
// may see the active snapshot metadata).
export function SnapshotInfo({ snapshot }: Readonly<{ snapshot: PricingSnapshotDTO | null }>) {
  if (!snapshot) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        type="button"
        disabled
        aria-label="No active pricing snapshot"
      >
        <WalletCards />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          type="button"
          aria-label={`Active pricing snapshot: ${snapshot.name}`}
        >
          <WalletCards />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Active pricing snapshot
            </span>
            <span className="text-sm font-medium text-foreground">{snapshot.name}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">Currency</dt>
              <dd className="font-medium text-foreground">{snapshot.currency}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">Freshness</dt>
              <dd>
                <Badge variant="secondary">{snapshot.freshnessState}</Badge>
              </dd>
            </div>
            <div className="col-span-2 grid gap-0.5">
              <dt className="text-xs text-muted-foreground">Captured</dt>
              <dd className="font-medium text-foreground">{formatDate(snapshot.capturedAt)}</dd>
            </div>
          </dl>
        </div>
      </PopoverContent>
    </Popover>
  );
}
