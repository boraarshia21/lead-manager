
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173"
}));
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
