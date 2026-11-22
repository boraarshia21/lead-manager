
const { test, expect } = require("@playwright/test");
const { signUpNewUser } = require("./helpers");

test("form validates required fields, email and phone", async ({ page }) => {
    await signUpNewUser(page);
    await page.getByRole("button", { name: /add new lead/i }).click();

    // Check required fields
    await page.getByRole("button", { name: "Save Lead" }).click();
    await expect(page.locator('input[name="name"]')).toHaveAttribute("required", "");

    // Check invalid email
    await page.locator('input[name="name"]').fill("Validation Test");
    await page.locator('input[name="email"]').fill("invalid-email");
    await page.locator('input[name="phone"]').fill("9876543222");
    await page.locator('input[name="company"]').fill("Test Company");
    await page.locator('select[name="source"]').selectOption("Website");
    await page.getByRole("button", { name: "Save Lead" }).click();

    await expect(page.locator('input[name="email"]')).toHaveJSProperty("validity.valid", false);

    // Check invalid phone
    await page.locator('input[name="email"]').fill("valid@gmail.com");
    await page.locator('input[name="phone"]').fill("12345");
    await page.getByRole("button", { name: "Save Lead" }).click();

    await expect(page.locator(".form-error")).toContainText("Please enter a valid Indian phone number.");
});
