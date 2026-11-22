const { test, expect } = require("@playwright/test");
const { signUpNewUser } = require("./helpers");

const API = process.env.API_URL || "http://localhost:5000/api";

test("leads table paginates 10 per page and sorts by name", async ({ page, request }) => {
    await signUpNewUser(page);
    const token = await page.evaluate(() => localStorage.getItem("leadflow-token"));
    const headers = { Authorization: `Bearer ${token}` };

    // Seed 12 leads for this user through the API
    for (let i = 1; i <= 12; i++) {
        const res = await request.post(`${API}/leads`, {
            headers,
            data: { name: `Lead ${String(i).padStart(2, "0")}`, email: `p${i}@example.com`, phone: "9876543210", company: "Paging Co", source: "Referral" }
        });
        expect(res.status()).toBe(201);
    }

    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await expect(page.locator(".table-footer")).toContainText("Showing 1–10 of 12 leads");

    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(2);

    // Sorting A–Z resets to page 1 with "Lead 01" first
    await page.getByLabel("Sort leads").selectOption("name-asc");
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    await expect(page.locator(".lead-name").first()).toHaveText("Lead 01");
});
