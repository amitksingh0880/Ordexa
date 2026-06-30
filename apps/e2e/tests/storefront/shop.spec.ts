import { test, expect } from "@playwright/test";

test.describe("storefront", () => {
  test("serves the shop app", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Shop/i);
  });

  test("shows the brand and account link in the header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "ORDEXA" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Account" })).toBeVisible();
  });

  test("renders the sign-in page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("links from sign-in to registration", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /create account/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
  });

  test("requires login to view the account page", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login/);
  });
});
