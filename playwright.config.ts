import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: [
    {
      command: 'cd server && node --env-file=.env --import tsx/esm src/index.ts',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -- --port 3000',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
});
