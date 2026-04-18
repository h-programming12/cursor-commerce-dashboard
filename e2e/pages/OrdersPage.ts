import { type Locator, type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export class OrdersPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URLS.ACCOUNT.ORDERS);
  }

  ordersHistoryHeading(): Locator {
    return this.page.getByRole("heading", { name: "Orders History" });
  }

  /** `OrdersTable`의 `aria-label`과 동일한 전체 주문 UUID 기준 */
  orderDetailControl(orderId: string): Locator {
    return this.page.getByRole("button", {
      name: `주문 ${orderId} 상세 보기`,
    });
  }

  myAccountHeading(): Locator {
    return this.page.getByRole("heading", { level: 1, name: "My Account" });
  }

  async clickFirstDesktopOrderRow(): Promise<void> {
    await this.page.locator("tbody tr[role='button']").first().click();
  }

  desktopOrderRows(): Locator {
    return this.page.locator("tbody tr[role='button']");
  }
}
