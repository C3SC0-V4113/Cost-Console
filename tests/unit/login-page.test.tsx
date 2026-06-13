import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/login/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => null),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const messages: Record<string, string> = {
      metaTitle: 'Sign in to Cost Console',
      metaDescription: 'Authenticate to use Cost Console.',
      title: 'Sign in to Cost Console',
      subtitle: 'Use your portfolio account to continue.',
    };
    return messages[key] ?? key;
  }),
}));

vi.mock('@/components/auth/email-form', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  EmailForm: ({ defaultEmail }: { defaultEmail?: string }) => (
    <form aria-label="email form">
      <label htmlFor="email">Email</label>
      <input id="email" defaultValue={defaultEmail} />
    </form>
  ),
}));

describe('Login page', () => {
  it('renders the email-first sign-in shell when there is no active session', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText(/sign in to cost console/i)).toBeDefined();

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDefined();
  });
});
