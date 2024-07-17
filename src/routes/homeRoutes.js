const express = require("express");
const router = express.Router();
const {
  getFirstName,
  postTransaction,
  getBalance,
  getTransactions,
} = require("../controllers/homeController");

// All get requests
router.get("/:email", getFirstName);
router.get("/balance/:email", getBalance);
router.get("/transactions/:email", getTransactions);

// All post requests
router.post("/transaction", postTransaction);

module.exports = router;
