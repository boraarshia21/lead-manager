
const Lead = require("../models/lead");

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public
const createLead = async (req, res) => {
    try {
        const { name, email, phone, company, source, status } = req.body;

        // Check required fields
        if (!name || !email || !phone || !company || !source) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Create a new lead in MongoDB
        const lead = await Lead.create({
            name,
            email,
            phone,
            company,
            source,
            status
        });

        res.status(201).json({
            message: "Lead created successfully",
            lead
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Server error while creating lead"
        });
    }
};

module.exports = { createLead };
