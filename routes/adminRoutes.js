const pool = require("../config/database");

const express = require("express");
const {
  getUsers,
  updateUserStatus,
  getDashboardData,
  getUserDetails,
  deleteUser,
  updateUserDetails,
  createUser,
} = require("../controllers/adminController");
const { getEventsByCategory } = require("../models/Event");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/dashboard", getUserFromToken, getDashboardData);

router.get("/users", getUserFromToken, getUsers);

router.put("/users/:id/status", getUserFromToken, updateUserStatus);

router.get("/users/:id/edit", getUserFromToken, getUserDetails);

router.delete("/users/:id", getUserFromToken, deleteUser);

router.put("/users/:id/edit", getUserFromToken, updateUserDetails);

router.get("/users/create", getUserFromToken, (req, res) => {
  res.render("admin/create-user");
});

router.post("/users", getUserFromToken, createUser);

router.get("/events/categories", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT category, COUNT(*) as count FROM events GROUP BY category
      `);
    const data = {};
    result.rows.forEach((row) => {
      data[row.category] = row.count;
    });
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch event categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
