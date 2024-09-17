const express = require("express");
const {
  createRegistration,
  getEventRegistrations,
  updateRegistration,
} = require("../controllers/registrationController");
const router = express.Router();

router.post("/", createRegistration);

router.get("/:event_id", getEventRegistrations);

router.put("/:id", updateRegistration);

module.exports = router;
