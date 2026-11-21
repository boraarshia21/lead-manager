
const express = require("express");
const router = express.Router();

const { createLead,getLeads } = require("../controllers/leadController");

// POST /api/leads
router.post("/", createLead);
// GET /api/leads - Get all leads
router.get("/", getLeads);
module.exports = router;
