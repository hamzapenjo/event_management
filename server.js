const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const { getUserFromToken } = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventTypeRoutes = require("./routes/eventTypeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const session = require("express-session");
const cron = require("node-cron");
const pool = require("./config/database");

const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/auth", authRoutes);

app.use("/admin", getUserFromToken, eventRoutes);

app.use("/registrations", registrationRoutes);

app.use("/admin", getUserFromToken, adminRoutes);

app.use("/admin", eventTypeRoutes);

app.use("/admin", locationRoutes);

cron.schedule("0 0 * * *", async () => {
  console.log("Running a daily check to unblock users.");
  const query = `
        UPDATE users
        SET status = 'active', block_until = null
        WHERE block_until IS NOT NULL AND block_until < NOW()
        RETURNING *;
    `;

  try {
    const result = await pool.query(query);
    console.log("Unblocked users:", result.rows);
  } catch (error) {
    console.error("Error unblocking users:", error);
  }
});

app.use("/user", userRoutes);

app.use("/organizer", organizerRoutes);

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});
