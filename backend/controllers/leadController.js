
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

// @desc    Update an existing lead
// @route   PUT /api/leads/:id
// @access  Public
const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead updated successfully",
            lead
        });

    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid lead ID or lead data"
            });
        }

        res.status(500).json({
            message: "Server error while updating lead"
        });
    }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Public
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.status(200).json({
            message: "Lead deleted successfully"
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        res.status(500).json({
            message: "Server error while deleting lead"
        });
    }
};

module.exports = { createLead,getLeads,updateLead,deleteLead };
