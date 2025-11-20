// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Main Playwright config for DigiERP
 * All tests are in tests/ directory
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js', '**/*-tests.js'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Giảm từ 10 xuống 2 workers
  reporter: [
    ['html', { outputFolder: './tests/reports/html-report' }],
    ['json', { outputFile: './tests/reports/test-results.json' }],
    ['junit', { outputFile: './tests/reports/junit-results.xml' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Thêm delay để tránh rate limiting
    extraHTTPHeaders: {
      'User-Agent': 'Playwright-Test'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  outputDir: './tests/reports/test-results/',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});