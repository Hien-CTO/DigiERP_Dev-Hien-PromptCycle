const { test, expect } = require('@playwright/test');

test('Simple Auth Test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
  console.log('✅ Simple auth test passed');
});
