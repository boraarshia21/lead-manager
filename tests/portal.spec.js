const { test, expect } = require("@playwright/test");

test("Lead Manager portal should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "All Leads" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by name, email or company...")).toBeVisible();
});