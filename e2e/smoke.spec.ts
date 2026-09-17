import { test, expect } from "@playwright/test";

test.describe("navigation", () => {
  test("home page loads with the landing hero canvas", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your Name" }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();

    await page.mouse.move(100, 100);
    await page.mouse.move(400, 300);
    await page.waitForTimeout(100);

    expect(errors).toEqual([]);
  });

  test("can navigate to the projects page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  });

  test("can navigate to the contact page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/contact");
    await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
  });
});
