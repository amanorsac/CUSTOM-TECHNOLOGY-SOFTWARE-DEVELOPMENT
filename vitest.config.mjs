import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tests/unit/**/*.test.js'],
          passWithNoTests: true,
        },
      },
      {
        plugins: [cloudflareTest({
          wrangler: { configPath: './wrangler.jsonc' },
          // Tests run against the request address; the site-origin tests set SITE_ORIGIN themselves.
          miniflare: { bindings: { SITE_ORIGIN: '' } },
        })],
        test: {
          name: 'worker',
          include: ['tests/worker/**/*.test.js'],
        },
      },
    ],
  },
});
