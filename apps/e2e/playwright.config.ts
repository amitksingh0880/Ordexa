import { defineConfig } from "@playwright/test";

const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:4173";
const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "http://localhost:4174";

const ADMIN_PORT = new URL(ADMIN_URL).port;
const STOREFRONT_PORT = new URL(STOREFRONT_URL).port;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "admin",
      testMatch: /admin\/.*\.spec\.ts$/,
      use: { baseURL: ADMIN_URL },
    },
    {
      name: "storefront",
      testMatch: /storefront\/.*\.spec\.ts$/,
      use: { baseURL: STOREFRONT_URL },
    },
  ],
  webServer: [
    {
      command: `bunx vite --port ${ADMIN_PORT} --strictPort`,
      cwd: "../admin",
      url: ADMIN_URL,
      timeout: 120_000,
      reuseExistingServer: true,
    },
    {
      command: `bunx vite --port ${STOREFRONT_PORT} --strictPort`,
      cwd: "../storefront",
      url: STOREFRONT_URL,
      timeout: 120_000,
      reuseExistingServer: true,
    },
  ],
});
