const jwt = require("jsonwebtoken");
const User = require("../models/user");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const signToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const userResponse = user => ({ id: user._id, name: user.name, email: user.email });

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !name.trim() || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = await User.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            message: "Account created successfully",
            token: signToken(user._id),
            user: userResponse(user)
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        res.status(500).json({ message: "Server error while creating account" });
    }
};

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Logged in successfully",
            token: signToken(user._id),
            user: userResponse(user)
        });

    } catch (error) {
        res.status(500).json({ message: "Server error while logging in" });
    }
};

// @desc    Get the logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
    res.status(200).json({ user: userResponse(req.user) });
};

module.exports = { signup, login, getMe };
