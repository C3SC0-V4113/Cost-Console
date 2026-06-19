import { expect, test } from '@playwright/test';

const password = 'CostConsole!2026';

// A freshly registered Identity-Service account is a standard (non-admin) user.
// Pricing snapshot routes are admin-only (ADR 0007), so the account must be
// shown the access-denied panel instead of the catalog.
test('blocks standard users from the admin pricing catalog', async ({ page }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- conditional restriction to one browser project
  test.skip(test.info().project.name !== 'chromium', 'Admin gate is exercised on chromium only.');
  test.setTimeout(60_000);

  const email = `gate-${Date.now()}@costconsole.test`;

  // Register a brand-new (non-admin) account.
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page).toHaveURL(/\/login\/register/);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(
    page.getByRole('heading', { name: /authenticated ai cost playground/i })
  ).toBeVisible();

  // Visiting the admin pricing surface directly must surface the access-denied
  // panel, not the snapshot catalog.
  await page.goto('/pricing-snapshots');
  await expect(page.getByRole('heading', { name: /admin access required/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /back to playground/i })).toBeVisible();
});
