const { test, expect } = require('@playwright/test');

test('Simple Login Test', async ({ page }) => {
  // Test với một trang web đơn giản trước
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
  console.log('✅ Simple login test passed');
});
