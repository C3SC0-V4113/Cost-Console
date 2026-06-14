import { expect, test } from '@playwright/test';

const password = 'CostConsole!2026';

test('registers a new account, signs out, and signs back in through Identity-Service', async ({
  page,
}) => {
  // eslint-disable-next-line playwright/no-skipped-test -- conditional restriction to one browser project
  test.skip(test.info().project.name !== 'chromium', 'Auth flow is exercised on chromium only.');
  test.setTimeout(60_000);

  const email = `e2e-${Date.now()}@costconsole.test`;

  // --- Register a brand-new account ---
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/login\/register/);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  // Lands in the authenticated playground; the database-backed shell shows the
  // active pricing snapshot, which proves the private DB read path works.
  await expect(
    page.getByRole('heading', { name: /authenticated ai cost playground/i })
  ).toBeVisible();
  await expect(page.getByText('Active snapshot: 2026-06 Curated Core Pricing')).toBeVisible();

  // --- Sign out ---
  await page.getByRole('button', { name: /signed in as/i }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);

  // --- Sign back in with the same credentials ---
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/login\/password/);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('heading', { name: /authenticated ai cost playground/i })
  ).toBeVisible();
});
