import { type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URLS.COMMERCE.HOME);
  }

  /** 상품 그리드 카드에서 제목과 일치하는 상품으로 이동 */
  async openProductDetailByName(productName: string): Promise<void> {
    await this.page
      .getByRole("list", { name: "Product grid" })
      .getByRole("heading", { level: 3, name: productName })
      .click();
  }

  async firstProductName(): Promise<string> {
    const text = await this.page
      .getByRole("list", { name: "Product grid" })
      .getByRole("heading", { level: 3 })
      .first()
      .innerText();
    return text.trim();
  }

  async clickFirstProductInGrid(): Promise<void> {
    await this.page
      .getByRole("list", { name: "Product grid" })
      .getByRole("heading", { level: 3 })
      .first()
      .click();
  }
}
