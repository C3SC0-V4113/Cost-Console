'use client';

import { WalletCards } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import type { PricingSnapshotDTO } from '@/lib/data/dto';

// Compact, accessible access to the active pricing snapshot metadata. Replaces a
// header text block that overflowed and was hidden on mobile: an icon button on
// every screen opens a popover with the snapshot details (ADR 0007: normal users
// may see the active snapshot metadata).
export function SnapshotInfo({ snapshot }: Readonly<{ snapshot: PricingSnapshotDTO | null }>) {
  const t = useTranslations('snapshotInfo');
  const format = useFormatter();

  if (!snapshot) {
    return (
      <Button variant="outline" size="icon-sm" type="button" disabled aria-label={t('empty')}>
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
          aria-label={t('trigger', { name: snapshot.name })}
        >
          <WalletCards />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('heading')}
            </span>
            <span className="text-sm font-medium text-foreground">{snapshot.name}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">{t('currency')}</dt>
              <dd className="font-medium text-foreground">{snapshot.currency}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">{t('freshness')}</dt>
              <dd>
                <Badge variant="secondary">{snapshot.freshnessState}</Badge>
              </dd>
            </div>
            <div className="col-span-2 grid gap-0.5">
              <dt className="text-xs text-muted-foreground">{t('captured')}</dt>
              <dd className="font-medium text-foreground">
                {format.dateTime(new Date(snapshot.capturedAt), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </PopoverContent>
    </Popover>
  );
}
