import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrdersPage } from "../pages/OrdersPage";
import { TEST_USER, URLS } from "../fixtures/test-data";
import {
  buildOrderPostBody,
  computeClientTotals,
  fetchCartJson,
  sumCartSubtotal,
  FULL_FLOW_SHIPPING,
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

test.describe("전체 구매 플로우 (E2E + API)", () => {
  test("홈 → 상세 → 장바구니 → 결제 → API 주문 → 주문 목록", async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const ordersPage = new OrdersPage(page);

    let productName = "";

    await test.step("Step 1: 홈에서 상품 목록 확인", async () => {
      await homePage.goto();
      await expect(
        page.getByRole("list", { name: "Product grid" })
      ).toBeVisible();
      const items = page
        .getByRole("list", { name: "Product grid" })
        .getByRole("listitem");
      expect(await items.count()).toBeGreaterThan(0);
    });

    await test.step("Step 2: 상품 상세 → Add to Cart", async () => {
      productName = await homePage.firstProductName();
      await homePage.clickFirstProductInGrid();
      await expect(page).toHaveURL(PRODUCT_DETAIL_PATH);
      await productDetailPage.addToCart(productName);
      await expect(
        page.getByRole("status").filter({ hasText: /장바구니에 추가/ })
      ).toBeVisible({ timeout: 5_000 });
    });

    await test.step("Step 3: 장바구니에서 상품명 확인", async () => {
      await cartPage.goto();
      await expect(page).toHaveURL(/\/cart$/);
      await expect(cartPage.cartItem(productName)).toBeVisible();
    });

    await test.step("Step 4: 결제 페이지 도달 및 배송 정보 입력, 금액 0 아님", async () => {
      await cartPage.goToCheckout();
      await expect(page).toHaveURL(/\/checkout$/);
      await checkoutPage.fillContactAndShipping(FULL_FLOW_SHIPPING);
      const summary = checkoutPage.orderSummary();
      await expect(summary).toBeVisible();
      const totalRow = summary
        .getByText("Total", { exact: true })
        .locator("..");
      await expect(totalRow.locator("span").last()).not.toHaveText("0원");
      await expect(totalRow.locator("span").last()).toHaveText(
        /[1-9][\d,]*원$/
      );
    });

    let orderId = "";

    await test.step("Step 5: POST /api/orders (page.request, 결제 위젯 대체)", async () => {
      const api = page.request;
      const cart = await fetchCartJson(api);
      expect(cart.items.length).toBeGreaterThan(0);
      const subtotal = sumCartSubtotal(cart.items);
      expect(subtotal).toBeGreaterThan(0);
      const totals = computeClientTotals(subtotal);
      const body = buildOrderPostBody(FULL_FLOW_SHIPPING, totals);
      const orderRes = await api.post("/api/orders", { data: body });
      expect(orderRes.status()).toBe(200);
      const json = (await orderRes.json()) as { orderId: string };
      expect(json.orderId.length).toBeGreaterThan(0);
      orderId = json.orderId;
    });

    await test.step("Step 6: /account/orders에서 주문 번호 확인", async () => {
      await ordersPage.goto();
      await expect(page).toHaveURL(/\/account\/orders/);
      const shortId = orderId.slice(0, 8);
      await expect(page.getByText(`#${shortId}`, { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await expect(ordersPage.orderDetailControl(orderId)).toBeVisible();
    });
  });
});
