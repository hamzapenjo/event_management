const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/User");

const getUserFromToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "blocked") {
      req.session.errorMessage = "Your account has been blocked.";
      return res.redirect("/auth/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = { getUserFromToken };
