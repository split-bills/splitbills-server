const express = require("express");
const router = express.Router();
const {
  getFirstName,
  postTransaction,
  getBalance,
  getTransactions,
} = require("../controllers/homeController");

// All get requests
router.get("/name", getFirstName);
router.get("/balance", getBalance);
router.get("/transactions", getTransactions);

// All post requests
router.post("/transaction", postTransaction);

module.exports = router;
