import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/(private)/page';

describe('Console home page', () => {
  it('renders the authenticated playground summary', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /cost console now opens behind project-scoped login/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/admin-only snapshots/i)).toBeDefined();
  });
});
