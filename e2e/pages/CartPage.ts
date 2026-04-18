import { type Locator, type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URLS.ACCOUNT.CART);
  }

  cartItem(productName: string): Locator {
    return this.page.getByRole("listitem", {
      name: `Cart item: ${productName}`,
    });
  }

  async goToCheckout(): Promise<void> {
    await this.page.getByRole("link", { name: "Checkout" }).click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByRole("link", { name: "Continue Shopping" }).click();
  }
}
