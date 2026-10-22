import { defineConfig, devices } from '@playwright/test';

// PW_PORT lets a second checkout (a git worktree) run its own server beside the usual one on 8787.
const PORT = Number(process.env.PW_PORT || 8787);
const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: ORIGIN },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Firefox is opt-in (set PW_FIREFOX=1); it cannot launch on the dev machine.
    ...(process.env.PW_FIREFOX === '1'
      ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }]
      : []),
  ],
  webServer: {
    // Local runs answer as localhost, not the real domain set in wrangler.jsonc. ADMIN_DEV_EMAIL opens the
    // back office on localhost only (src/lib/access.js); it is never set in production.
    command: `npx wrangler dev --port ${PORT} --local-upstream localhost:${PORT} --var SITE_ORIGIN:${ORIGIN} --var ADMIN_DEV_EMAIL:dev@ctsd.local`,
    url: ORIGIN,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
