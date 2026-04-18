import { test, expect, type Page } from "@playwright/test";
import type { CheckoutContactAndShipping } from "../pages/CheckoutPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
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

const SAMPLE_SHIPPING: CheckoutContactAndShipping = {
  contactFirstName: "E2E",
  contactLastName: "Shipping",
  contactPhone: "010-1234-5678",
  contactEmail: "e2e-checkout@example.com",
  shippingAddressLine1: "123 Test Street",
  shippingCountry: "South Korea",
  shippingCity: "Seoul",
  shippingState: "Seoul",
  shippingZip: "04501",
};

async function addFirstProductToCart(page: Page): Promise<void> {
  const homePage = new HomePage(page);
  const productDetailPage = new ProductDetailPage(page);
  await homePage.goto();
  const name = await homePage.firstProductName();
  await homePage.clickFirstProductInGrid();
  await productDetailPage.addToCart(name);
  await expect(
    page.getByRole("status").filter({ hasText: /장바구니에 추가/ })
  ).toBeVisible({ timeout: 5_000 });
}

test.describe("결제 페이지 도달 및 배송 정보", () => {
  test("장바구니에서 Checkout 클릭 → 결제 페이지 이동", async ({ page }) => {
    const cartPage = new CartPage(page);

    await test.step("장바구니에 상품 담기", async () => {
      await addFirstProductToCart(page);
    });

    await test.step("장바구니 → Checkout", async () => {
      await cartPage.goto();
      await expect(page).toHaveURL(/\/cart$/);
      await cartPage.goToCheckout();
    });

    await test.step("결제 URL 및 Check Out 제목", async () => {
      await expect(page).toHaveURL(/\/checkout$/);
      await expect(
        page.getByRole("heading", { name: "Check Out" })
      ).toBeVisible();
    });
  });

  test("배송 정보를 입력할 수 있다", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step("결제 페이지로 진입", async () => {
      await addFirstProductToCart(page);
      await cartPage.goto();
      await cartPage.goToCheckout();
      await expect(page).toHaveURL(/\/checkout$/);
    });

    await test.step("fillContactAndShipping로 필드 입력", async () => {
      await checkoutPage.fillContactAndShipping(SAMPLE_SHIPPING);
    });

    await test.step("입력값 반영 확인", async () => {
      await expect(page.getByLabel("First Name", { exact: true })).toHaveValue(
        SAMPLE_SHIPPING.contactFirstName
      );
      await expect(page.getByLabel("Last Name", { exact: true })).toHaveValue(
        SAMPLE_SHIPPING.contactLastName
      );
      await expect(
        page.getByLabel("Phone Number", { exact: true })
      ).toHaveValue(SAMPLE_SHIPPING.contactPhone);
      await expect(
        page.getByLabel("Email address", { exact: true })
      ).toHaveValue(SAMPLE_SHIPPING.contactEmail);
      await expect(
        page.getByLabel("Street Address *", { exact: true })
      ).toHaveValue(SAMPLE_SHIPPING.shippingAddressLine1);
      await expect(page.getByLabel("Country *", { exact: true })).toHaveValue(
        SAMPLE_SHIPPING.shippingCountry
      );
      await expect(
        page.getByLabel("Town / City *", { exact: true })
      ).toHaveValue(SAMPLE_SHIPPING.shippingCity);
      await expect(page.getByLabel("State", { exact: true })).toHaveValue(
        SAMPLE_SHIPPING.shippingState
      );
      await expect(page.getByLabel("Zip Code", { exact: true })).toHaveValue(
        SAMPLE_SHIPPING.shippingZip
      );
    });
  });

  test("주문 요약에 상품과 금액이 표시된다", async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step("결제 페이지로 진입", async () => {
      await addFirstProductToCart(page);
      await cartPage.goto();
      await cartPage.goToCheckout();
      await expect(page).toHaveURL(/\/checkout$/);
    });

    await test.step("Order summary에 Total이 0원이 아님", async () => {
      const summary = checkoutPage.orderSummary();
      await expect(summary).toBeVisible();
      await expect(
        summary.getByRole("heading", { name: "Order summary" })
      ).toBeVisible();
      const totalRow = summary
        .getByText("Total", { exact: true })
        .locator("..");
      await expect(totalRow.locator("span").last()).not.toHaveText("0원");
      await expect(totalRow.locator("span").last()).toHaveText(
        /[1-9][\d,]*원$/
      );
    });
  });
});
