import { type Page } from "@playwright/test";
import { URLS } from "../fixtures/test-data";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(URLS.AUTH.LOGIN);
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel("Email address").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }
}
