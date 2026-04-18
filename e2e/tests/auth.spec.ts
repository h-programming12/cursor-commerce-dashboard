import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USER } from "../fixtures/test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("로그인", () => {
  test("유효한 계정으로 로그인하면 홈페이지로 이동한다", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("로그인 페이지 접속 및 Sign In 제목 확인", async () => {
      await loginPage.goto();
      await expect(
        page.getByRole("heading", { name: "Sign In" })
      ).toBeVisible();
    });

    await test.step("이메일/비밀번호 입력 후 Sign In 클릭", async () => {
      await loginPage.login(TEST_USER.email, TEST_USER.password);
    });

    await test.step("URL이 홈(/)으로 변경됨", async () => {
      await expect(page).toHaveURL(/\/$/);
    });
  });

  test("잘못된 비밀번호로 로그인하면 에러가 표시된다", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step("로그인 시도", async () => {
      await loginPage.goto();
      await loginPage.login(TEST_USER.email, "wrong-password-e2e");
    });

    await test.step("토스트 에러 메시지 표시", async () => {
      await expect(page.getByRole("status")).toContainText(
        /Invalid|credentials/i,
        { timeout: 8_000 }
      );
    });

    await test.step("로그인 페이지에 머무름", async () => {
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
