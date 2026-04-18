import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { OrdersPage } from "../pages/OrdersPage";
import { TEST_USER, URLS } from "../fixtures/test-data";
import {
  SAMPLE_ORDER_SHIPPING,
  buildOrderPostBody,
  clearCartViaApi,
  computeClientTotals,
  fetchCartJson,
  sumCartSubtotal,
} from "../fixtures/order-api-helpers";

const PRODUCT_DETAIL_PATH =
  /\/products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

test.beforeEach(async ({ page }) => {
  await page.goto(URLS.AUTH.LOGIN);
  await page.waitForLoadState("domcontentloaded");
  if (/\/login/.test(page.url())) {
    const loginPage = new LoginPage(page);
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await page.waitForURL(/\/$/, { timeout: 20_000 });
  }
});

test.describe("POST /api/orders (API)", () => {
  test("장바구니에 상품이 있을 때 POST /api/orders로 주문을 생성할 수 있다", async ({
    page,
  }) => {
    const api = page.request;
    let orderId = "";

    await test.step("사전 조건: 장바구니 비우고 상품 추가 (POST /api/cart)", async () => {
      await clearCartViaApi(api);
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.clickFirstProductInGrid();
      await expect(page).toHaveURL(PRODUCT_DETAIL_PATH);
      const match = page
        .url()
        .match(
          /\/products\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
        );
      expect(match?.[1]).toBeTruthy();
      const productId = match![1];
      const addRes = await api.post("/api/cart", {
        data: { productId, quantity: 1 },
      });
      expect(addRes.ok()).toBeTruthy();
    });

    await test.step("POST /api/orders → 200, orderId", async () => {
      const cart = await fetchCartJson(api);
      const subtotal = sumCartSubtotal(cart.items);
      expect(subtotal).toBeGreaterThan(0);
      const totals = computeClientTotals(subtotal);
      const body = buildOrderPostBody(SAMPLE_ORDER_SHIPPING, totals);
      const orderRes = await api.post("/api/orders", { data: body });
      expect(orderRes.status()).toBe(200);
      const json = (await orderRes.json()) as {
        orderId: string;
        tossOrderId: string;
      };
      expect(json.orderId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(json.tossOrderId?.length).toBeGreaterThan(0);
      orderId = json.orderId;
    });

    await test.step("GET /account/orders에서 생성된 주문 표시 확인", async () => {
      const ordersPage = new OrdersPage(page);
      await ordersPage.goto();
      await expect(page).toHaveURL(/\/account\/orders/);
      const shortId = orderId.slice(0, 8);
      await expect(page.getByText(`#${shortId}`, { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await expect(ordersPage.orderDetailControl(orderId)).toBeVisible();
    });
  });

  test("장바구니가 비어 있으면 주문 생성이 실패한다", async ({ page }) => {
    const api = page.request;
    await clearCartViaApi(api);
    const totals = computeClientTotals(0);
    const body = buildOrderPostBody(SAMPLE_ORDER_SHIPPING, totals);
    const orderRes = await api.post("/api/orders", {
      data: {
        ...body,
        clientShippingFee: 0,
        clientTotal: 0,
      },
    });
    expect(orderRes.status()).toBeGreaterThanOrEqual(400);
  });
});
