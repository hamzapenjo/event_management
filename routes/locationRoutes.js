const express = require("express");
const {
  getAllLocations,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/locations", getUserFromToken, getAllLocations);
router.get("/locations/create", getUserFromToken, (req, res) =>
  res.render("admin/create-location")
);
router.post("/locations", getUserFromToken, createLocation);
router.get("/locations/:id/edit", getUserFromToken, getLocation);
router.put("/locations/:id", getUserFromToken, updateLocation);
router.delete("/locations/:id", getUserFromToken, deleteLocation);

module.exports = router;
