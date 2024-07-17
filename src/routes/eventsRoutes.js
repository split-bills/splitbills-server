const express = require("express");
const router = express.Router();
const {
  getNames,
  postEvent,
  getEvents,
} = require("../controllers/eventsController");

// All get requests
router.get("/names", getNames);
router.get("/all", getEvents);

// All post requests
router.post("/new", postEvent);

module.exports = router;
