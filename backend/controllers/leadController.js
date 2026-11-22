
const Lead = require("../models/lead");

// Only these fields may be set by the client (owner always comes from the token)
const EDITABLE_FIELDS = ["name", "email", "phone", "company", "source", "status"];

const pickEditable = body => {
    const data = {};
    for (const field of EDITABLE_FIELDS) {
        if (body[field] !== undefined) data[field] = body[field];
    }
    return data;
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
    try {
        const { name, email, phone, company, source } = req.body;

        // Check required fields
        if (!name || !email || !phone || !company || !source) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        // Create a new lead owned by the logged-in user
        const lead = await Lead.create({
            ...pickEditable(req.body),
            owner: req.user._id
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

// @desc    Get all leads of the logged-in user
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ owner: req.user._id }).sort({ createdAt: -1 });

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
// @access  Private
const updateLead = async (req, res) => {
    try {
        const lead = await Lead.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            pickEditable(req.body),
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
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid lead ID or lead data" });
        }

        res.status(500).json({
            message: "Server error while updating lead"
        });
    }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

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

module.exports = { createLead, getLeads, updateLead, deleteLead };
