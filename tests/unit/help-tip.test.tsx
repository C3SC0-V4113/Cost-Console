import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HelpTip } from '@/components/help/help-tip';
import { TooltipProvider } from '@/components/ui/tooltip';

import type { ReactNode } from 'react';

// HelpTip wraps a Radix Tooltip (tip) or Popover (info). Radix overlays do not
// open in jsdom, so the opened content is verified by the Playwright e2e in a
// real browser; here we assert the always-present, accessible trigger.
function renderHelpTip(ui: ReactNode) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('HelpTip', () => {
  it('renders an accessible help button labeled by the topic at the tip level', () => {
    renderHelpTip(
      <HelpTip label="What is cache hit rate?" level="tip">
        The share of tokens billed as cached reads.
      </HelpTip>
    );

    expect(screen.getByRole('button', { name: 'What is cache hit rate?' })).toBeTruthy();
  });

  it('renders an accessible help button labeled by the topic at the info level', () => {
    renderHelpTip(
      <HelpTip
        label="What is prompt caching?"
        level="info"
        sourceHref="https://example.com/docs"
        sourceLabel="Provider docs"
      >
        Repeated prefixes may be priced differently.
      </HelpTip>
    );

    expect(screen.getByRole('button', { name: 'What is prompt caching?' })).toBeTruthy();
  });
});
