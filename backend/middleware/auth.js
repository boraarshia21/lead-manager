const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Verifies the "Authorization: Bearer <token>" header and attaches req.user
const protect = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Not authorized, please log in" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Session expired or invalid, please log in again" });
    }
};

module.exports = { protect };
