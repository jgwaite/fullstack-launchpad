import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'

const baseURL = process.env.PW_BASE_URL || 'http://localhost:5180'
const port = Number(new URL(baseURL).port || 5180)

const common: PlaywrightTestConfig = {
  testDir: 'tests',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
}

const useWebServer = process.env.PW_WEB_SERVER !== '0'

export default defineConfig({
  ...common,
  ...(useWebServer
    ? {
        webServer: {
          command: `npm run dev -- --host --port ${port}`,
          port,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }
    : {}),
})
