const express = require("express");
const {
  getOrganizerDashboard,
  getOrganizerEvents,
  getCreateEventPage,
  createOrganizerEvent,
  getEditEventPage,
  updateEvent,
  deleteExistingEvent,
  getRegistrationsByOrganizer,
  updateRegistrationStatus,
  updateEventStatus,
  getNotifications,
} = require("../controllers/organizerController");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const {
  getProfilePage,
  updateProfileImage,
  updateProfileInfo,
  changePassword,
} = require("../controllers/profileController");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();
const pool = require("../config/database");
router.get("/dashboard", getUserFromToken, getOrganizerDashboard);

router.get("/events", getUserFromToken, getOrganizerEvents);

router.get("/events/create", getUserFromToken, getCreateEventPage);

router.post("/events", getUserFromToken, createOrganizerEvent);

router.get("/events/:id/edit", getUserFromToken, getEditEventPage);
router.post("/events/:id/edit", getUserFromToken, updateEvent);

router.delete("/events/:id", getUserFromToken, deleteExistingEvent);

router.get("/registrations", getUserFromToken, getRegistrationsByOrganizer);

router.post("/events/:id/status", getUserFromToken, updateEventStatus);

router.post(
  "/registrations/:id/update-status",
  getUserFromToken,
  updateRegistrationStatus
);

router.get("/profile", getUserFromToken, getProfilePage);

router.post("/profile/update-image", getUserFromToken, updateProfileImage);

router.post("/profile/update-info", getUserFromToken, updateProfileInfo);

router.get("/notifications", getUserFromToken, getNotifications);

router.post("/profile/change-password", getUserFromToken, changePassword);

router.post("/notifications/:id/read", async (req, res) => {
  const notificationId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE id = $1`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await pool.query(`UPDATE notifications SET seen = true WHERE id = $1`, [
      notificationId,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
