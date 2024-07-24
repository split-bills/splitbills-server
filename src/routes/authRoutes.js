const express = require("express");
const router = express.Router();
const { signUp, login, check } = require("../controllers/authController");

// All get requests
router.get("/check", check);

// All post requests
router.post("/signup", signUp);
router.post("/login", login);

module.exports = router;
