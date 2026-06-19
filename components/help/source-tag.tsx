'use client';

import { ExternalLink } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

import type { PricingSourceDTO } from '@/lib/data/dto';

// Traceability affordance: a badge that reveals where a value came from on hover
// or focus. Distinct from HelpTip (which explains concepts) — this surfaces the
// structured source metadata that pricing and benchmark values must carry.
function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function SourceTag({ source }: Readonly<{ source: PricingSourceDTO | null }>) {
  const t = useTranslations('sourceTag');
  const format = useFormatter();

  const formatSourceDate = (iso: string): string =>
    format.dateTime(new Date(iso), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

  if (!source) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {t('noSource')}
      </Badge>
    );
  }

  const typeLabel = t(`types.${source.sourceType}`);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={t('ariaLabel', { title: source.title })}
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Badge variant="secondary">{typeLabel}</Badge>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <div className="grid gap-3 text-sm">
          <div className="grid gap-1">
            <span className="font-medium text-foreground">{source.title}</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {safeHostname(source.url)}
              <ExternalLink className="size-3" />
            </a>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">{t('type')}</dt>
              <dd className="text-foreground">{typeLabel}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">{t('retrieved')}</dt>
              <dd className="text-foreground">{formatSourceDate(source.retrievedAt)}</dd>
            </div>
            {source.sourceDate ? (
              <div className="col-span-2 grid gap-0.5">
                <dt className="text-muted-foreground">{t('sourceDate')}</dt>
                <dd className="text-foreground">{formatSourceDate(source.sourceDate)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
