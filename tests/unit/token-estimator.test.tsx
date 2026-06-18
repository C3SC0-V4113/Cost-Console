import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { TokenEstimator } from '@/components/help/token-estimator';
import { countWords, estimateTokens } from '@/components/help/token-utils';
import messages from '@/messages/en.json';

describe('estimateTokens', () => {
  it('returns zero for empty text', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estimates roughly one token per four characters', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
  });
});

describe('countWords', () => {
  it('returns zero for blank text', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('counts whitespace-separated words', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('  one  two  three ')).toBe(3);
  });
});

describe('TokenEstimator', () => {
  it('updates the readout as text changes', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TokenEstimator />
      </NextIntlClientProvider>
    );

    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'a'.repeat(20) } });

    expect(screen.getByText('20')).toBeTruthy(); // characters
    expect(screen.getByText('5')).toBeTruthy(); // ~ tokens (20 / 4)
  });
});
