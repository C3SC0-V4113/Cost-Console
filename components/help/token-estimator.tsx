'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { countWords, estimateTokens } from './token-utils';

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="grid gap-0.5 rounded-md bg-muted p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

export function TokenEstimator() {
  const [text, setText] = useState('');

  return (
    <div className="grid gap-3">
      <Badge variant="secondary" className="w-fit">
        Approximate, not billing math
      </Badge>
      <div className="grid gap-1.5">
        <Label htmlFor="token-lab-input">Text</Label>
        <Textarea
          id="token-lab-input"
          rows={5}
          placeholder="Paste or type any text to estimate its tokens."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="~ tokens" value={estimateTokens(text)} />
        <Metric label="characters" value={text.length} />
        <Metric label="words" value={countWords(text)} />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        ≈ 1 token per ~4 characters in English-like text. One A4 page is roughly 400–900 tokens
        depending on language, density, and formatting.
      </p>
    </div>
  );
}
