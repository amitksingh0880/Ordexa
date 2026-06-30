import { test, expect } from "@playwright/test";

test.describe("admin authentication", () => {
  test("serves the admin app", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ordexa - Admin/i);
  });

  test("redirects unauthenticated visitors to the login screen", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows the sign-in form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("gates a protected route behind login", async ({ page }) => {
    await page.goto("/products");
    await expect(page).toHaveURL(/\/login/);
  });

  test("blocks submission of an invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
