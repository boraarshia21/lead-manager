
const express = require("express");
const router = express.Router();

const { createLead,getLeads,updateLead,deleteLead} = require("../controllers/leadController");
const { protect } = require("../middleware/auth");

// Every lead route requires a logged-in user
router.use(protect);

// POST /api/leads
router.post("/", createLead);
// GET /api/leads - Get all leads
router.get("/", getLeads);
router.put("/:id",updateLead);
router.delete("/:id", deleteLead);
module.exports = router;
