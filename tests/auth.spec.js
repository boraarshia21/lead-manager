const { test, expect } = require("@playwright/test");
const { signUpNewUser } = require("./helpers");

test("unauthenticated visitor sees the login page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All Leads" })).toHaveCount(0);
});

test("user can sign up, log out and log back in", async ({ page }) => {
    const user = await signUpNewUser(page);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await page.getByLabel("Email Address *").fill(user.email);
    await page.getByLabel("Password *").fill(user.password);
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByRole("heading", { name: "All Leads" })).toBeVisible();
    await expect(page.locator(".profile-name")).toHaveText(user.name);
});

test("login shows an error for wrong credentials", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email Address *").fill("nobody@example.com");
    await page.getByLabel("Password *").fill("wrongpass");
    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.locator(".form-error")).toContainText("Invalid email or password");
});

test("session survives a page reload", async ({ page }) => {
    await signUpNewUser(page);
    await page.reload();
    await expect(page.getByRole("heading", { name: "All Leads" })).toBeVisible();
});
