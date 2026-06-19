import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { PricingCatalogTable } from '@/components/pricing/pricing-catalog-table';
import { TooltipProvider } from '@/components/ui/tooltip';
import esMessages from '@/messages/es.json';

import type { PricingCatalogDTO } from '@/lib/data/dto';

const chatRow: PricingCatalogDTO = {
  id: 'row-chat',
  snapshotId: 'snap-1',
  provider: 'OpenAI',
  model: 'gpt-5.5',
  capability: 'chat',
  contextWindowTokens: 400000,
  currency: 'USD',
  priceUnit: 'per_1m_tokens',
  inputPrice: '5.00',
  outputPrice: '15.00',
  cachedInputReadPrice: '0.50',
  cacheWritePrice: null,
  embeddingPrice: null,
  validityState: 'active',
  notes: null,
  source: {
    title: 'OpenAI API pricing',
    url: 'https://openai.com/api/pricing',
    sourceType: 'official_pricing',
    sourceDate: '2026-05-01T00:00:00.000Z',
    retrievedAt: '2026-06-01T00:00:00.000Z',
  },
};

const embeddingRow: PricingCatalogDTO = {
  id: 'row-embed',
  snapshotId: 'snap-1',
  provider: 'Cohere',
  model: 'embed-v4',
  capability: 'embedding',
  contextWindowTokens: null,
  currency: 'USD',
  priceUnit: 'per_1m_tokens',
  inputPrice: null,
  outputPrice: null,
  cachedInputReadPrice: null,
  cacheWritePrice: null,
  embeddingPrice: '0.10',
  validityState: 'manual',
  notes: null,
  source: null,
};

function renderInSpanish(rows: PricingCatalogDTO[]) {
  return render(
    <NextIntlClientProvider locale="es" messages={esMessages} timeZone="UTC">
      <TooltipProvider>
        <PricingCatalogTable rows={rows} currency="USD" />
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe('PricingCatalogTable', () => {
  it('renders model, provider, and localized capability', () => {
    renderInSpanish([chatRow]);

    expect(screen.getByText('gpt-5.5')).toBeTruthy();
    expect(screen.getByText('OpenAI')).toBeTruthy();
    expect(screen.getByText('Chat')).toBeTruthy();
  });

  it('formats prices regionally with the per-million suffix', () => {
    renderInSpanish([chatRow]);

    // Spanish currency: "5,00 US$" with the "/1M" suffix in a single cell.
    // Anchored so "5,00 US$/1M" does not also match "15,00 US$/1M" (output).
    expect(screen.getByText(/^5,00\sUS\$\/1M$/u)).toBeTruthy();
    expect(screen.getByText(/^0,50\sUS\$\/1M$/u)).toBeTruthy();
    expect(screen.getByText(/^15,00\sUS\$\/1M$/u)).toBeTruthy();
  });

  it('renders an em dash for missing prices and a no-source badge', () => {
    renderInSpanish([embeddingRow]);

    expect(screen.getByText('Manual')).toBeTruthy(); // validityState 'manual'
    expect(screen.getByText('Sin fuente')).toBeTruthy();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText(/^0,10\sUS\$\/1M$/u)).toBeTruthy();
  });

  it('localizes the validity badge', () => {
    renderInSpanish([chatRow]);

    // validityState 'active' -> "Vigente" in the pricing.validity namespace.
    expect(screen.getByText('Vigente')).toBeTruthy();
  });

  it('shows an empty state when there are no rows', () => {
    renderInSpanish([]);

    expect(screen.getByText('Este snapshot todavía no tiene filas de catálogo.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
