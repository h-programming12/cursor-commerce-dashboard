import { test, expect } from "@playwright/test";
import { OrdersPage } from "../pages/OrdersPage";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USER, URLS } from "../fixtures/test-data";

test.beforeEach(async ({ page }) => {
  await page.goto(URLS.AUTH.LOGIN);
  await page.waitForLoadState("domcontentloaded");
  if (/\/login/.test(page.url())) {
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await page.waitForURL(/\/$/, { timeout: 20_000 });
  }
});

test.describe("주문 내역", () => {
  test("주문 내역 페이지에 접근할 수 있다", async ({ page }) => {
    const ordersPage = new OrdersPage(page);

    await test.step("/account/orders 이동", async () => {
      await ordersPage.goto();
      await expect(page).toHaveURL(/\/account\/orders/);
    });

    await test.step("My Account 제목", async () => {
      await expect(ordersPage.myAccountHeading()).toBeVisible();
    });

    await test.step("Orders History 섹션", async () => {
      await expect(ordersPage.ordersHistoryHeading()).toBeVisible();
    });
  });

  test("주문이 있으면 주문 번호와 상태가 표시된다", async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    const rowCount = await ordersPage.desktopOrderRows().count();
    if (rowCount === 0) {
      test.skip();
    }

    await test.step("주문 번호(#…) 셀", async () => {
      await expect(
        page.locator("table tbody tr[role='button']").first()
      ).toContainText(/^#/);
    });

    await test.step("상태 뱃지 텍스트", async () => {
      await expect(
        page.getByText(/대기중|결제완료|처리중|배송중|배송완료|취소/).first()
      ).toBeVisible();
    });
  });

  test("주문을 클릭하면 상세 페이지로 이동한다", async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();

    if ((await ordersPage.desktopOrderRows().count()) === 0) {
      test.skip();
    }

    await test.step("첫 주문 행 클릭 → 상세 URL", async () => {
      await Promise.all([
        page.waitForURL(/\/account\/orders\/[0-9a-f-]{36}/i),
        ordersPage.clickFirstDesktopOrderRow(),
      ]);
    });

    await test.step("Order Summary 및 상품 목록 섹션", async () => {
      await expect(
        page.getByRole("heading", { name: "Order Summary" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Products in this order" })
      ).toBeVisible();
    });
  });
});
