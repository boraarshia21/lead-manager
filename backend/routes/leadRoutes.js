
const express = require("express");
const router = express.Router();

const { createLead,getLeads,updateLead } = require("../controllers/leadController");

// POST /api/leads
router.post("/", createLead);
// GET /api/leads - Get all leads
router.get("/", getLeads);
router.put("/:id",updateLead)
module.exports = router;
