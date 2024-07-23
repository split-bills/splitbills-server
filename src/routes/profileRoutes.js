const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  patchDetails,
} = require("../controllers/profileController");

// All get requests
router.get("/details", getUserDetails);

// All post requests

// All patch routes here
router.patch("/details", patchDetails);

module.exports = router;
