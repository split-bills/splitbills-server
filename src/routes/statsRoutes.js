const express = require("express");
const router = express.Router();
const { getExpenses } = require("../controllers/statsController");

// All get requests
router.get("/expenses", getExpenses);

// All post requests

module.exports = router;
