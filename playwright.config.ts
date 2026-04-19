import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/** E2E는 항상 webServer(`next start`)와 같은 오리진이어야 합니다. 빈 문자열 시크릿 등은 localhost로 폴백합니다. */
const baseURL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://127.0.0.1:3000"
).replace(/\/$/, "");

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [
        ["list"],
        ["html", { open: "never" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["github"],
      ]
    : [["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
  ...(isCI
    ? {
        webServer: {
          command: "yarn build && yarn start",
          url: baseURL,
          // GitHub: 항상 새로 기동. 로컬에서 CI=true만 켠 경우(예: act)에는 이미 떠 있는 3000번 서버를 재사용.
          reuseExistingServer: process.env.GITHUB_ACTIONS !== "true",
          timeout: 300_000,
          env: { ...process.env, PORT: process.env.PORT || "3000" },
        },
      }
    : {}),
  projects: [
    {
      name: "setup",
      testMatch: "fixtures/auth.setup.ts",
    },
    {
      name: "chromium",
      testMatch: "tests/**/*.spec.ts",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: "e2e/.auth/user.json",
      },
    },
  ],
});
