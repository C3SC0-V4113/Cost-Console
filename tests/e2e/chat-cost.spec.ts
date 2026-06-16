import { expect, test } from '@playwright/test';

const password = 'CostConsole!2026';

test('chat cost playground estimates, recomputes, and exposes help', async ({ page }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- conditional restriction to one browser project
  test.skip(test.info().project.name !== 'chromium', 'Exercised on chromium only.');
  test.setTimeout(90_000);

  const email = `chat-${Date.now()}@costconsole.test`;

  // Register and land in the playground (root redirects to /chat).
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole('heading', { name: /model chat token cost/i })).toBeVisible();

  // The default result is rendered from the active snapshot's pricing.
  await expect(page.getByText('Per month')).toBeVisible();
  await expect(page.getByText(/\$\d/).first()).toBeVisible();

  // HelpTip reveals concept help with a source in a popover.
  await page.getByRole('button', { name: 'What is prompt caching?' }).click();
  await expect(page.getByText(/Repeated prompt prefixes or context/i)).toBeVisible();
  await page.keyboard.press('Escape');

  // Token Lab estimates tokens from typed text.
  await page.getByRole('button', { name: /Token Lab/ }).click();
  await page.getByLabel('Text', { exact: true }).fill('a'.repeat(20));
  await expect(page.getByText('5', { exact: true })).toBeVisible();

  // Changing the model triggers a backend recompute.
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'OpenAI · gpt-5.4', exact: true }).click();
  await expect(page.getByText(/\$\d/).first()).toBeVisible();
});
