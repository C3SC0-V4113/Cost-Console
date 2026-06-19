'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { HelpTip } from '@/components/help/help-tip';
import { SourceTag } from '@/components/help/source-tag';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrencyFormat } from '@/hooks/use-currency-format';

import type { PricingCatalogDTO } from '@/lib/data/dto';

// Admin-only read view of the pricing catalog captured in a snapshot. Prices
// arrive as serialized Decimal strings and are formatted regionally; every row
// surfaces its capability, validity, and cited source so admins can trace where
// a value came from. The UI never recomputes economics — it only displays the
// captured catalog (see AGENTS.md product boundary).
export function PricingCatalogTable({
  rows,
  currency,
}: Readonly<{ rows: PricingCatalogDTO[]; currency: string }>) {
  const t = useTranslations('pricing');
  const format = useFormatter();
  const formatCurrency = useCurrencyFormat(currency);

  const price = (value: string | null): string =>
    value === null
      ? t('catalog.noValue')
      : `${formatCurrency(value)}${t('catalog.perMillionSuffix')}`;

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-1">
        <div className="flex items-center gap-1">
          <h3 className="font-heading text-lg font-semibold text-card-foreground">
            {t('catalog.heading')}
          </h3>
          <HelpTip label={t('catalog.systemPrompt.label')}>
            {t('catalog.systemPrompt.body')}
          </HelpTip>
        </div>
        <p className="text-sm text-muted-foreground">{t('catalog.description')}</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          {t('catalog.empty')}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableCaption className="mb-3">{t('catalog.caption', { currency })}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('catalog.colModel')}</TableHead>
                <TableHead>{t('catalog.colCapability')}</TableHead>
                <TableHead className="text-right">{t('catalog.colContext')}</TableHead>
                <TableHead className="text-right">{t('catalog.colInput')}</TableHead>
                <TableHead className="text-right">{t('catalog.colCachedInput')}</TableHead>
                <TableHead className="text-right">{t('catalog.colCacheWrite')}</TableHead>
                <TableHead className="text-right">{t('catalog.colOutput')}</TableHead>
                <TableHead className="text-right">{t('catalog.colEmbedding')}</TableHead>
                <TableHead>{t('catalog.colValidity')}</TableHead>
                <TableHead>{t('catalog.colSource')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">{row.model}</span>
                    <span className="block text-xs text-muted-foreground">{row.provider}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t(`capability.${row.capability}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {row.contextWindowTokens === null
                      ? t('catalog.noValue')
                      : format.number(row.contextWindowTokens)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{price(row.inputPrice)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {price(row.cachedInputReadPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {price(row.cacheWritePrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {price(row.outputPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {price(row.embeddingPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.validityState === 'active' ? 'secondary' : 'outline'}>
                      {t(`validity.${row.validityState}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <SourceTag source={row.source} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
