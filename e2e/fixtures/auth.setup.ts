import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test as setup } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USER } from "./test-data";

const storagePath = path.join(process.cwd(), "e2e", ".auth", "user.json");

setup("인증 상태 저장", async ({ page }) => {
  await mkdir(path.dirname(storagePath), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_USER.email, TEST_USER.password);

  await page.context().storageState({ path: storagePath });
});
