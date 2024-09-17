const express = require("express");
const {
  getAllEvents,
  getEventDetails,
  registerForEvent,
  updateInterests,
  getUserDashboard,
  cancelRegistration,
  getAllRegistrations,
} = require("../controllers/userController.js");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const pool = require("../config/database");
const router = express.Router();

router.get("/dashboard", getUserFromToken, getUserDashboard);

router.post("/update-interests", getUserFromToken, updateInterests);

router.get("/events", getUserFromToken, getAllEvents);

router.post("/events/register/:eventId", getUserFromToken, registerForEvent);

router.get("/registrations", getUserFromToken, getAllRegistrations);

router.post(
  "/registrations/cancel/:registrationId",
  getUserFromToken,
  cancelRegistration
);

router.get("/event-details/:eventId", getUserFromToken, getEventDetails);

router.get("/search-events", getUserFromToken, async (req, res) => {
  const { query } = req.query;
  try {
    const results = await pool.query(
      `SELECT e.id, e.name, e.date, l.name as location_name, e.category 
        FROM events e JOIN locations l ON e.location_id = l.id 
        WHERE e.name ILIKE $1 OR l.name ILIKE $1`,
      [`%${query}%`]
    );
    res.json(results.rows);
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/organizer/details/:id", async (req, res) => {
  const organizerId = req.params.id;
  try {
    const organizer = await pool.query(
      "SELECT first_name, last_name, bio, profile_image FROM users WHERE id = $1",
      [organizerId]
    );

    if (organizer.rows.length === 0) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.json(organizer.rows[0]);
  } catch (error) {
    console.error("Error fetching organizer details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
