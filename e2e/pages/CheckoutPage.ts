import { type Locator, type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export interface CheckoutContactAndShipping {
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  contactEmail: string;
  shippingAddressLine1: string;
  shippingCountry: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  orderSummary(): Locator {
    return this.page.getByRole("complementary", { name: "Order summary" });
  }

  async goto(): Promise<void> {
    await this.page.goto(URLS.ACCOUNT.CHECKOUT);
  }

  async fillContactAndShipping(
    values: CheckoutContactAndShipping
  ): Promise<void> {
    await this.page
      .getByLabel("First Name", { exact: true })
      .fill(values.contactFirstName);
    await this.page
      .getByLabel("Last Name", { exact: true })
      .fill(values.contactLastName);
    await this.page
      .getByLabel("Phone Number", { exact: true })
      .fill(values.contactPhone);
    await this.page
      .getByLabel("Email address", { exact: true })
      .fill(values.contactEmail);
    await this.page
      .getByLabel("Street Address *", { exact: true })
      .fill(values.shippingAddressLine1);
    await this.page
      .getByLabel("Country *", { exact: true })
      .fill(values.shippingCountry);
    await this.page
      .getByLabel("Town / City *", { exact: true })
      .fill(values.shippingCity);
    await this.page
      .getByLabel("State", { exact: true })
      .fill(values.shippingState);
    await this.page
      .getByLabel("Zip Code", { exact: true })
      .fill(values.shippingZip);
  }

  async setUseDifferentBilling(checked: boolean): Promise<void> {
    const box = this.page.getByLabel("Use a different billing address");
    if (checked) {
      await box.check();
    } else {
      await box.uncheck();
    }
  }

  async placeOrder(): Promise<void> {
    await this.page.getByRole("button", { name: "Place Order" }).click();
  }
}
