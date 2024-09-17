const pool = require("../config/database");
const multer = require("multer");
const path = require("path");

const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage }).single("profile_image");

const getProfilePage = async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT first_name, last_name, email, bio, profile_image FROM users WHERE id = $1",
      [req.user.id]
    );

    if (user.rows.length > 0) {
      res.render("organizer/profile", { user: user.rows[0] });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error loading profile page:", error);
    res.status(500).send("Error loading profile.");
  }
};

const updateProfileImage = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send("Error uploading file.");
    }

    const profile_image = req.file ? req.file.filename : req.user.profile_image;

    try {
      await pool.query("UPDATE users SET profile_image = $1 WHERE id = $2", [
        profile_image,
        req.user.id,
      ]);

      res.redirect("/organizer/profile");
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).send("Error updating profile image.");
    }
  });
};

const updateProfileInfo = async (req, res) => {
  const { first_name, last_name, email, bio } = req.body;

  try {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, email = $3, bio = $4 WHERE id = $5",
      [first_name, last_name, email, bio, req.user.id]
    );
    res.redirect("/organizer/profile");
  } catch (error) {
    console.error("Error updating profile info:", error);
    res.status(500).send("Error updating profile info.");
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const hashedPassword = result.rows[0].password;

    const match = await bcrypt.compare(currentPassword, hashedPassword);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      newHashedPassword,
      req.user.id,
    ]);

    res.json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating password." });
  }
};

module.exports = {
  getProfilePage,
  updateProfileImage,
  updateProfileInfo,
  changePassword,
};
