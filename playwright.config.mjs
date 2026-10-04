import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:8787' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Firefox is opt-in (set PW_FIREFOX=1); it cannot launch on the dev machine.
    ...(process.env.PW_FIREFOX === '1'
      ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }]
      : []),
  ],
  webServer: {
    command: 'npx wrangler dev --port 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
