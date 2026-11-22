
const { test, expect } = require("@playwright/test");
const { signUpNewUser } = require("./helpers");

test("user can add, edit and delete a lead", async ({ page }) => {
    const leadName = `Playwright Test ${Date.now()}`;

    page.on("console", msg => console.log("BROWSER:", msg.text()));
    page.on("pageerror", error => console.log("PAGE ERROR:", error.message));
    page.on("requestfailed", request => console.log("REQUEST FAILED:", request.url(), request.failure()?.errorText));

    await signUpNewUser(page);
    await page.getByRole("button", { name: /add new lead/i }).click();

    await page.locator('input[name="name"]').fill(leadName);
    await page.locator('input[name="email"]').fill("playwright@gmail.com");
    await page.locator('input[name="phone"]').fill("9876543222");
    await page.locator('input[name="company"]').fill("Test Company");
    await page.locator('select[name="source"]').selectOption("Website");

    const responsePromise = page.waitForResponse(response =>
        response.url().includes("/api/leads") && response.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Save Lead" }).click();

    const response = await responsePromise;
    console.log("POST STATUS:", response.status());
    console.log("POST BODY:", await response.text());

    console.log("FORM ERROR:", await page.locator(".form-error").allTextContents());
    console.log("PAGE TEXT:", (await page.locator("body").innerText()).slice(-1500));

    const leadRow = page.locator("tr").filter({ hasText: leadName });
    await expect(leadRow).toBeVisible({ timeout: 10000 });
});
