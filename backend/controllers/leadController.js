
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

// @desc    Get all leads
// @route   GET /api/leads
// @access  Public
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });

        res.status(200).json({
            count: leads.length,
            leads
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching leads"
        });
    }
};

module.exports = { createLead,getLeads };
