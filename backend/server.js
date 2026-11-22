
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Add it to backend/.env");
    process.exit(1);
}

// Middleware
app.use(express.json());
// CLIENT_URL can hold one or more comma-separated origins (e.g. your Vercel URL)
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"].concat(
    (process.env.CLIENT_URL || "").split(",").map(url => url.trim().replace(/\/$/, "")).filter(Boolean)
);
app.use(cors({ origin: allowedOrigins }));
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Lead Manager Backend is running!");
});

// Connect to database before starting server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
