import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '@/app/(private)/page';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

describe('Console home page', () => {
  it('redirects to the chat cost playground', () => {
    HomePage();

    expect(redirect).toHaveBeenCalledWith('/chat');
  });
});
