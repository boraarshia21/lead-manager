
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    retries: 0,
    reporter: "html",
    use: {
        baseURL: "http://127.0.0.1:5173",
        trace: "retain-on-failure",
        screenshot: "only-on-failure"
    },
    projects: [
        {
            name: "api",
            testMatch: /api\.spec\.js/
        },
        {
            name: "ui",
            testIgnore: /api\.spec\.js/,
            use: { ...devices["Desktop Chrome"] }
        }
    ],
    webServer: [
        {
            command: "npm run dev",
            cwd: "./backend",
            url: "http://localhost:5000/",
            reuseExistingServer: !process.env.CI,
            timeout: 120000
        },
        {
            command: "npm run dev -- --host 127.0.0.1",
            cwd: "./frontend",
            url: "http://127.0.0.1:5173/",
            reuseExistingServer: !process.env.CI,
            timeout: 120000
        }
    ]
});
