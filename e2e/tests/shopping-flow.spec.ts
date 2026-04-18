import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
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

const PRODUCT_DETAIL_PATH =
  /\/products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

test.describe("상품 조회 및 장바구니", () => {
  test("상품 목록에서 상품 카드가 1개 이상 표시된다", async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step("홈(상품 목록)으로 이동", async () => {
      await homePage.goto();
      await expect(
        page.getByRole("list", { name: "Product grid" })
      ).toBeVisible();
    });

    await test.step("그리드에 listitem 1개 이상", async () => {
      const items = page
        .getByRole("list", { name: "Product grid" })
        .getByRole("listitem");
      await expect(items.first()).toBeVisible();
      expect(await items.count()).toBeGreaterThan(0);
    });
  });

  test("상품을 클릭하면 상세 페이지로 이동한다", async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step("첫 상품 카드 클릭", async () => {
      await homePage.goto();
      await homePage.clickFirstProductInGrid();
    });

    await test.step("URL이 /products/[uuid] 패턴", async () => {
      await expect(page).toHaveURL(PRODUCT_DETAIL_PATH);
    });
  });

  test("Add to Cart 클릭 시 장바구니에 추가된다", async ({ page }) => {
    const homePage = new HomePage(page);
    const productDetailPage = new ProductDetailPage(page);

    await test.step("상품 상세로 이동 후 장바구니 담기", async () => {
      await homePage.goto();
      const name = await homePage.firstProductName();
      await homePage.clickFirstProductInGrid();
      await expect(page).toHaveURL(PRODUCT_DETAIL_PATH);
      await productDetailPage.addToCart(name);
    });

    await test.step("토스트 또는 장바구니 링크로 반영 확인", async () => {
      const toast = page
        .getByRole("status")
        .filter({ hasText: /장바구니에 추가/ });
      const cartLink = page.getByRole("link", {
        name: /장바구니로 이동.*개 상품/,
      });
      await expect(toast.or(cartLink).first()).toBeVisible({ timeout: 5_000 });
    });
  });

  test("장바구니 페이지에서 추가한 상품이 보인다", async ({ page }) => {
    const homePage = new HomePage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartPage = new CartPage(page);
    let productName = "";

    await test.step("상품을 장바구니에 담기", async () => {
      await homePage.goto();
      productName = await homePage.firstProductName();
      await homePage.clickFirstProductInGrid();
      await productDetailPage.addToCart(productName);
      await expect(
        page.getByRole("status").filter({ hasText: /장바구니에 추가/ })
      ).toBeVisible({ timeout: 5_000 });
    });

    await test.step("/cart에서 해당 상품 행 확인", async () => {
      await cartPage.goto();
      await expect(page).toHaveURL(/\/cart$/);
      await expect(cartPage.cartItem(productName)).toBeVisible();
    });
  });
});
