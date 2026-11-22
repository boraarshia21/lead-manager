
const { test, expect } = require("@playwright/test");

test("user can search for a lead by name", async ({ page }) => {
    const leadName = `Search Test ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("button", { name: /add new lead/i }).click();

    await page.locator('input[name="name"]').fill(leadName);
    await page.locator('input[name="email"]').fill(`search${Date.now()}@gmail.com`);
    await page.locator('input[name="phone"]').fill("9876543222");
    await page.locator('input[name="company"]').fill("Search Company");
    await page.locator('select[name="source"]').selectOption("Website");

    await page.getByRole("button", { name: "Save Lead" }).click();

    const search = page.getByPlaceholder("Search by name, email or company...");
    await search.fill(leadName);

    const row = page.locator("tr").filter({ hasText: leadName });
    await expect(row).toBeVisible();

    await page.once("dialog", dialog => dialog.accept());
    await row.getByRole("button", { name: "Delete lead" }).click();
    await expect(row).toHaveCount(0);
});

test("user cannot submit a lead with an invalid phone number", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /add new lead/i }).click();

    await page.locator('input[name="name"]').fill("Invalid Phone Test");
    await page.locator('input[name="email"]').fill("valid@gmail.com");
    await page.locator('input[name="phone"]').fill("12345");
    await page.locator('input[name="company"]').fill("Test Company");
    await page.locator('select[name="source"]').selectOption("Website");

    await page.getByRole("button", { name: "Save Lead" }).click();

    await expect(page.locator(".form-error")).toContainText("Please enter a valid Indian phone number.");
});
