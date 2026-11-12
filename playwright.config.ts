import { defineConfig, devices } from '@playwright/test';
import { SITES } from './src/config/sites';

/**
 * One project per website. The project name is the site key used everywhere else:
 *   npx playwright test --project=course
 *   npx playwright test --project=main --grep @checkout
 * https://playwright.dev/docs/test-projects
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './src/global-setup.ts', // blocks a second run while one is active
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a forgotten test.only must not silently skip the rest in CI
  workers: Number(process.env.WORKERS || 4), // keep it polite to production
  retries: Number(process.env.RETRIES ?? 1), // production + network: retry once before calling it a finding
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['./src/findings/reporter.ts'],
  ],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1366, height: 900 },
    userAgent: devices['Desktop Chrome'].userAgent + ' AkashaQA/1.0',
    locale: 'en-US',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  outputDir: 'test-results',

  projects: [
    {
      name: 'course',
      testDir: './tests/course',
      use: { baseURL: SITES.course.baseURL },
    },
    {
      name: 'main',
      testDir: './tests/main',
      // Wix marks its elements with data-hook="…", so page.getByTestId('add-to-cart') works.
      use: { baseURL: SITES.main.baseURL, testIdAttribute: 'data-hook' },
    },
  ],
});
