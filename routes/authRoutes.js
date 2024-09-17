const express = require("express");
const {
  registerUser,
  loginUser,
  updateUserInterests,
} = require("../controllers/AuthController");
const { getUserFromToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  const message = req.session.errorMessage || "";
  req.session.errorMessage = null;
  res.render("login", { errorMessage: message });
});

router.post("/register", registerUser);

router.post("/login", loginUser);

router.put("/interests/:user_id", updateUserInterests);

module.exports = router;
