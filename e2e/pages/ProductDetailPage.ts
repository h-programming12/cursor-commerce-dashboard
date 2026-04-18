import { type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export class ProductDetailPage {
  constructor(private readonly page: Page) {}

  async goto(productId: string): Promise<void> {
    await this.page.goto(URLS.COMMERCE.PRODUCT_DETAIL(productId));
  }

  /** aria-label: `Add ${productName} to cart` */
  async addToCart(productName: string): Promise<void> {
    await this.page
      .getByRole("button", {
        name: `Add ${productName} to cart`,
      })
      .click();
  }
}
