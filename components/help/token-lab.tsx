'use client';

import { Braces } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { TokenEstimator } from './token-estimator';

// Global access to the token estimator. The same TokenEstimator is mounted inline
// (inside a Collapsible) next to token inputs in the Chat Cost view.
export function TokenLab() {
  const t = useTranslations('tokenLab');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Braces data-icon="inline-start" />
          {t('trigger')}
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <TokenEstimator />
        </div>
      </SheetContent>
    </Sheet>
  );
}
