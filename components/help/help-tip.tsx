'use client';

import { CircleHelp, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Opt-in, accessible help affordance. It never opens on its own: an icon button
// reveals the explanation on demand. `level="tip"` is a one-line Tooltip;
// `level="info"` is a Popover for a short paragraph plus an optional source link.
// Requires a TooltipProvider ancestor (provided by the authenticated shell).
type HelpTipProps = {
  label: string;
  level?: 'tip' | 'info';
  children: React.ReactNode;
  sourceHref?: string;
  sourceLabel?: string;
};

export function HelpTip({
  label,
  level = 'tip',
  children,
  sourceHref,
  sourceLabel,
}: Readonly<HelpTipProps>) {
  // The trigger is the bare shadcn Button so the Tooltip/Popover trigger can
  // forward its handlers and ref through `asChild` (an intermediate wrapper
  // component would swallow them and the overlay would never open).
  const trigger = (
    <Button
      variant="ghost"
      size="icon-sm"
      type="button"
      aria-label={label}
      className="text-muted-foreground"
    >
      <CircleHelp />
    </Button>
  );

  if (level === 'tip') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent className="max-w-60 text-pretty">{children}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="grid gap-2 text-sm">
          <p className="leading-relaxed text-pretty text-foreground">{children}</p>
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {sourceLabel ?? 'Source'}
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
