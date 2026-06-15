'use client';

import { ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { formatDate } from '@/lib/format';

import type { PricingSourceDTO } from '@/lib/data/dto';

// Traceability affordance: a badge that reveals where a value came from on hover
// or focus. Distinct from HelpTip (which explains concepts) — this surfaces the
// structured source metadata that pricing and benchmark values must carry.
function sourceTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case 'official_pricing':
      return 'Official pricing';
    case 'official_docs':
      return 'Official docs';
    case 'third_party_benchmark':
      return 'Third-party benchmark';
    case 'vendor_benchmark':
      return 'Vendor benchmark';
    case 'internal_manual':
      return 'Manual entry';
    default:
      return sourceType;
  }
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function SourceTag({ source }: Readonly<{ source: PricingSourceDTO | null }>) {
  if (!source) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        No source
      </Badge>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`Source: ${source.title}`}
          className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Badge variant="secondary">{sourceTypeLabel(source.sourceType)}</Badge>
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
              <dt className="text-muted-foreground">Type</dt>
              <dd className="text-foreground">{sourceTypeLabel(source.sourceType)}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-muted-foreground">Retrieved</dt>
              <dd className="text-foreground">{formatDate(source.retrievedAt)}</dd>
            </div>
            {source.sourceDate ? (
              <div className="col-span-2 grid gap-0.5">
                <dt className="text-muted-foreground">Source date</dt>
                <dd className="text-foreground">{formatDate(source.sourceDate)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
