const express = require("express");
const {
  getAllEventTypesController,
  getCreateEventTypePage,
  createNewEventType,
  getEditEventTypePage,
  updateExistingEventType,
  deleteExistingEventType,
} = require("../controllers/EventTypeController");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/event-types", getUserFromToken, getAllEventTypesController);

router.get("/event-types/create", getUserFromToken, getCreateEventTypePage);

router.post("/event-types", getUserFromToken, createNewEventType);

router.get("/event-types/:id/edit", getUserFromToken, getEditEventTypePage);

router.put("/event-types/:id", getUserFromToken, updateExistingEventType);

router.delete("/event-types/:id", getUserFromToken, deleteExistingEventType);

module.exports = router;
