import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USER, URLS } from "../fixtures/test-data";

test.describe("비로그인 세션", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("사용자가 보호된 주문 내역 URL로 접근하면 로그인 페이지로 이동할 수 있다", async ({
    page,
  }) => {
    await page.goto(URLS.ACCOUNT.ORDERS);
    await expect(page).toHaveURL(/\/login/);
    const next = new URL(page.url()).searchParams.get("next");
    expect(next).toBe("/account/orders");
  });

  test("사용자가 보호된 장바구니 URL로 접근하면 로그인 페이지로 이동할 수 있다", async ({
    page,
  }) => {
    await page.goto(URLS.ACCOUNT.CART);
    await expect(page).toHaveURL(/\/login/);
    const next = new URL(page.url()).searchParams.get("next");
    expect(next).toBe("/cart");
  });
});

test.describe("로그인 세션", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URLS.AUTH.LOGIN);
    await page.waitForLoadState("domcontentloaded");
    if (/\/login/.test(page.url())) {
      const loginPage = new LoginPage(page);
      await loginPage.login(TEST_USER.email, TEST_USER.password);
      await page.waitForURL(/\/$/, { timeout: 20_000 });
    }
  });

  test("사용자가 로그인 페이지에 접근하면 홈으로 이동할 수 있다", async ({
    page,
  }) => {
    await page.goto(URLS.AUTH.LOGIN);
    await page.waitForURL(/\/$/, { timeout: 20_000 });
  });
});
