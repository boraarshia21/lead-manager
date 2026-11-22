const { expect } = require("@playwright/test");

// Signs up a brand-new user through the UI so every test starts with an empty, isolated lead list
async function signUpNewUser(page) {
    const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const user = { name: `Test User ${stamp}`, email: `ui${stamp}@example.com`, password: "secret123" };

    await page.goto("/");
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByLabel("Full Name *").fill(user.name);
    await page.getByLabel("Email Address *").fill(user.email);
    await page.getByLabel("Password *").fill(user.password);
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByRole("heading", { name: "All Leads" })).toBeVisible();
    return user;
}

module.exports = { signUpNewUser };
