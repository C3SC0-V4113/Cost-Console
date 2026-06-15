'use client';

import { Braces } from 'lucide-react';

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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Braces data-icon="inline-start" />
          Token Lab
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle>Token Lab</SheetTitle>
          <SheetDescription>
            Estimate how many tokens a piece of text is. The result is approximate, not exact
            billing math.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <TokenEstimator />
        </div>
      </SheetContent>
    </Sheet>
  );
}
