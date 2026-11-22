const { test, expect } = require("@playwright/test");
const { signUpNewUser } = require("./helpers");

test("Lead Manager portal should load successfully", async ({ page }) => {
    await signUpNewUser(page);
    await expect(page.getByRole("heading", { name: "All Leads" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by name, email or company...")).toBeVisible();
});