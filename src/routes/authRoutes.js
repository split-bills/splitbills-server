const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  check,
  logout,
} = require("../controllers/authController");

// All get requests
router.get("/check", check);

// All post requests
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
