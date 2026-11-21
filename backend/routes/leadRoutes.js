
const express = require("express");
const router = express.Router();

const { createLead } = require("../controllers/leadController");

// POST /api/leads
router.post("/", createLead);

module.exports = router;
