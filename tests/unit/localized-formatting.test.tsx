import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { generateMetadata } from '@/app/(private)/chat/page';
import { CostSummary } from '@/components/chat/cost-summary';
import { SnapshotInfo } from '@/components/console/snapshot-info';
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';

import type { ChatCostResult } from '@/lib/calc/chat-cost';

const serverIntlMocks = vi.hoisted(() => ({ getTranslations: vi.fn() }));

vi.mock('next-intl/server', () => serverIntlMocks);

const result: ChatCostResult = {
  provider: 'provider',
  model: 'model',
  currency: 'USD',
  cacheAvailable: true,
  lineItems: [
    {
      category: 'input',
      label: 'Uncached input',
      tokensPerInteraction: '1000',
      unitPrice: '1.5',
      costPerInteraction: '0.0015',
    },
  ],
  costPerInteraction: '0.0015',
  dailyCost: '1.5',
  monthlyCost: '45',
  yearlyCost: '540',
  assumptions: {
    interactionsPerDay: 1000,
    daysPerMonth: 30,
    promptCacheHitPercentage: 0,
    provider: 'provider',
    model: 'model',
    currency: 'USD',
  },
};

function renderInSpanish(children: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="es" messages={esMessages} timeZone="America/Los_Angeles">
      {children}
    </NextIntlClientProvider>
  );
}

describe('localized console formatting', () => {
  it('formats chat costs with the active locale', () => {
    renderInSpanish(<CostSummary result={result} />);

    expect(screen.getAllByText(/1,50\sUS\$/u)).not.toHaveLength(0);
    expect(screen.getAllByText(/0,0015\sUS\$/u)).not.toHaveLength(0);
  });

  it('formats the pricing snapshot date with the active locale', async () => {
    renderInSpanish(
      <SnapshotInfo
        snapshot={{
          id: 'snapshot-1',
          name: 'Snapshot',
          currency: 'USD',
          status: 'ACTIVE',
          freshnessState: 'fresh',
          capturedAt: '2026-06-17T00:30:00.000Z',
          validFrom: null,
          validTo: null,
          notes: null,
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Snapshot de precios activo: Snapshot' }));

    expect(await screen.findByText(/17 jun 2026/u)).toBeTruthy();
  });
});

describe('localized chat metadata', () => {
  it.each([
    { locale: 'en', messages: enMessages },
    { locale: 'es', messages: esMessages },
  ] as const)('returns $locale metadata from the request translations', async ({ messages }) => {
    serverIntlMocks.getTranslations.mockResolvedValue(
      (key: 'metaTitle' | 'metaDescription') => messages.chat[key]
    );

    await expect(generateMetadata()).resolves.toEqual({
      title: messages.chat.metaTitle,
      description: messages.chat.metaDescription,
    });
    expect(serverIntlMocks.getTranslations).toHaveBeenCalledWith('chat');
  });
});
