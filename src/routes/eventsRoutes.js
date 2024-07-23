const express = require("express");
const router = express.Router();
const {
  getNames,
  postEvent,
  getEvents,
  getEmail,
} = require("../controllers/eventsController");

// All get requests
router.get("/names", getNames);
router.get("/all", getEvents);
router.get("/email", getEmail);

// All post requests
router.post("/new", postEvent);

module.exports = router;
