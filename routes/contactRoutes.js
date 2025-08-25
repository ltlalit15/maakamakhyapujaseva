const express = require("express");
const { createContact, getContacts } = require("../controllers/contactController");

const router = express.Router();

// POST - submit contact form
router.post("/contact", createContact);

// GET - get all contact messages
router.get("/contact", getContacts);

module.exports = router;
