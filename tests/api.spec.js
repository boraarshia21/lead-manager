// API tests: talk to the Express backend directly (no browser)
const { test, expect } = require("@playwright/test");

const API = process.env.API_URL || "http://localhost:5000/api";

const uniqueEmail = prefix => `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;

const validLead = overrides => ({
    name: "API Test Lead",
    email: "lead@example.com",
    phone: "9876543210",
    company: "Acme Pvt Ltd",
    source: "Website",
    ...overrides
});

async function createUser(request) {
    const res = await request.post(`${API}/auth/signup`, {
        data: { name: "API User", email: uniqueEmail("api"), password: "secret123" }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    return { token: body.token, user: body.user, headers: { Authorization: `Bearer ${body.token}` } };
}

test.describe("Auth API", () => {
    test("signup returns a token and the user without the password", async ({ request }) => {
        const email = uniqueEmail("signup");
        const res = await request.post(`${API}/auth/signup`, { data: { name: "New User", email, password: "secret123" } });

        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body.token).toBeTruthy();
        expect(body.user).toMatchObject({ name: "New User", email });
        expect(body.user.password).toBeUndefined();
    });

    test("signup rejects duplicate email, bad email and short password", async ({ request }) => {
        const email = uniqueEmail("dup");
        await request.post(`${API}/auth/signup`, { data: { name: "A", email, password: "secret123" } });

        const dup = await request.post(`${API}/auth/signup`, { data: { name: "B", email, password: "secret123" } });
        expect(dup.status()).toBe(409);

        const badEmail = await request.post(`${API}/auth/signup`, { data: { name: "C", email: "not-an-email", password: "secret123" } });
        expect(badEmail.status()).toBe(400);

        const shortPw = await request.post(`${API}/auth/signup`, { data: { name: "D", email: uniqueEmail("pw"), password: "123" } });
        expect(shortPw.status()).toBe(400);
    });

    test("login works with correct password and fails with wrong one", async ({ request }) => {
        const email = uniqueEmail("login");
        await request.post(`${API}/auth/signup`, { data: { name: "Login User", email, password: "secret123" } });

        const ok = await request.post(`${API}/auth/login`, { data: { email, password: "secret123" } });
        expect(ok.status()).toBe(200);
        expect((await ok.json()).token).toBeTruthy();

        const bad = await request.post(`${API}/auth/login`, { data: { email, password: "wrong-password" } });
        expect(bad.status()).toBe(401);
    });

    test("/auth/me returns the current user", async ({ request }) => {
        const { headers, user } = await createUser(request);
        const res = await request.get(`${API}/auth/me`, { headers });
        expect(res.status()).toBe(200);
        expect((await res.json()).user.email).toBe(user.email);
    });
});

test.describe("Leads API", () => {
    test("lead routes require a valid token", async ({ request }) => {
        expect((await request.get(`${API}/leads`)).status()).toBe(401);
        expect((await request.post(`${API}/leads`, { data: validLead() })).status()).toBe(401);
        expect((await request.get(`${API}/leads`, { headers: { Authorization: "Bearer garbage" } })).status()).toBe(401);
    });

    test("full CRUD flow for a lead", async ({ request }) => {
        const { headers } = await createUser(request);

        // Create
        const created = await request.post(`${API}/leads`, { headers, data: validLead() });
        expect(created.status()).toBe(201);
        const lead = (await created.json()).lead;
        expect(lead.status).toBe("New");

        // List
        const list = await (await request.get(`${API}/leads`, { headers })).json();
        expect(list.count).toBe(1);
        expect(list.leads[0]._id).toBe(lead._id);

        // Update status
        const updated = await request.put(`${API}/leads/${lead._id}`, { headers, data: { status: "Qualified" } });
        expect(updated.status()).toBe(200);
        expect((await updated.json()).lead.status).toBe("Qualified");

        // Delete
        expect((await request.delete(`${API}/leads/${lead._id}`, { headers })).status()).toBe(200);
        expect((await request.delete(`${API}/leads/${lead._id}`, { headers })).status()).toBe(404);
    });

    test("create validates required fields, email, phone and source", async ({ request }) => {
        const { headers } = await createUser(request);

        const missing = await request.post(`${API}/leads`, { headers, data: { name: "Only name" } });
        expect(missing.status()).toBe(400);

        const badEmail = await request.post(`${API}/leads`, { headers, data: validLead({ email: "bad-email" }) });
        expect(badEmail.status()).toBe(400);

        const badPhone = await request.post(`${API}/leads`, { headers, data: validLead({ phone: "12345" }) });
        expect(badPhone.status()).toBe(400);

        const badSource = await request.post(`${API}/leads`, { headers, data: validLead({ source: "Carrier Pigeon" }) });
        expect(badSource.status()).toBe(400);
    });

    test("update rejects invalid status and invalid id", async ({ request }) => {
        const { headers } = await createUser(request);
        const lead = (await (await request.post(`${API}/leads`, { headers, data: validLead() })).json()).lead;

        const badStatus = await request.put(`${API}/leads/${lead._id}`, { headers, data: { status: "Maybe" } });
        expect(badStatus.status()).toBe(400);

        const badId = await request.put(`${API}/leads/not-an-id`, { headers, data: { status: "Lost" } });
        expect(badId.status()).toBe(400);
    });

    test("users only see and modify their own leads", async ({ request }) => {
        const alice = await createUser(request);
        const bob = await createUser(request);

        const lead = (await (await request.post(`${API}/leads`, { headers: alice.headers, data: validLead() })).json()).lead;

        const bobList = await (await request.get(`${API}/leads`, { headers: bob.headers })).json();
        expect(bobList.count).toBe(0);

        expect((await request.put(`${API}/leads/${lead._id}`, { headers: bob.headers, data: { status: "Lost" } })).status()).toBe(404);
        expect((await request.delete(`${API}/leads/${lead._id}`, { headers: bob.headers })).status()).toBe(404);

        // Owner cannot be reassigned through the update body
        await request.put(`${API}/leads/${lead._id}`, { headers: alice.headers, data: { owner: bob.user.id } });
        const aliceList = await (await request.get(`${API}/leads`, { headers: alice.headers })).json();
        expect(aliceList.count).toBe(1);
    });
});
