const pool = require("../config/database");

const updateInterests = async (req, res) => {
  const userId = req.user.id;
  const { interests } = req.body;

  try {
    const interestsArray = interests
      .split(",")
      .map((interest) => interest.trim());

    await pool.query("UPDATE users SET interests = $1 WHERE id = $2", [
      interestsArray,
      userId,
    ]);

    res.redirect("/user/dashboard");
  } catch (error) {
    console.error("Error updating interests:", error);
    res.status(500).send("Failed to update interests.");
  }
};

const getUserDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    const userResult = await pool.query(
      "SELECT interests FROM users WHERE id = $1",
      [userId]
    );
    const interestsArray = userResult.rows[0].interests || [];

    const interests =
      interestsArray.length > 0 ? interestsArray.join(", ") : "";

    const recommendedEventsQuery = `
          SELECT * FROM events WHERE category = ANY($1) LIMIT 5;
        `;
    const recommendedEvents = await pool.query(recommendedEventsQuery, [
      interestsArray,
    ]);

    const popularEventsQuery = `
          SELECT events.*, COUNT(registrations.event_id) AS registration_count
          FROM events
          LEFT JOIN registrations ON events.id = registrations.event_id
          GROUP BY events.id
          ORDER BY registration_count DESC
          LIMIT 5;
        `;
    const popularEvents = await pool.query(popularEventsQuery);

    const randomEventsQuery = `
          SELECT * FROM events ORDER BY RANDOM() LIMIT 5;
        `;
    const randomEvents = await pool.query(randomEventsQuery);

    res.render("user/dashboard", {
      interests,
      recommendedEvents: recommendedEvents.rows,
      popularEvents: popularEvents.rows,
      randomEvents: randomEvents.rows,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Failed to load dashboard.");
  }
};

const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await pool.query(
      `
          SELECT e.*, 
                 l.name as location_name, 
                 u.first_name || ' ' || u.last_name as organizer_name,
                 EXISTS (
                   SELECT 1 
                   FROM registrations 
                   WHERE user_id = $1 AND event_id = e.id
                 ) AS is_registered
          FROM events e
          JOIN locations l ON e.location_id = l.id
          JOIN users u ON e.organizer_id = u.id
        `,
      [userId]
    );

    res.render("user/events", {
      events: events.rows.map((event) => ({
        ...event,
        isRegistered: event.is_registered,
        organizerName: event.organizer_name,
      })),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Server Error");
  }
};

const registerForEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId;

  console.log("Registering for event:", eventId);

  try {
    const existingRegistration = await pool.query(
      `SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event.",
      });
    }

    await pool.query(
      `INSERT INTO registrations (user_id, event_id, status) VALUES ($1, $2, 'pending')`,
      [userId, eventId]
    );

    const eventDetails = await pool.query(
      `SELECT organizer_id, name FROM events WHERE id = $1`,
      [eventId]
    );

    const organizerId = eventDetails.rows[0].organizer_id;
    const eventName = eventDetails.rows[0].name;

    await pool.query(
      `INSERT INTO notifications (user_id, event_id, message, seen) VALUES ($1, $2, $3, $4)`,
      [
        organizerId,
        eventId,
        `New registration for your event: ${eventName}`,
        false,
      ]
    );

    res.json({
      success: true,
      message:
        "Registration successful, pending approval. Notification sent to the organizer.",
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await pool.query(
      `SELECT e.id, e.name as event_name, e.date, e.time, l.name as location_name, r.status 
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         JOIN locations l ON e.location_id = l.id
         WHERE r.user_id = $1`,
      [userId]
    );

    res.render("user/registrations", { registrations: registrations.rows });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).send("Server Error");
  }
};

const cancelRegistration = async (req, res) => {
  const registrationId = req.params.registrationId;

  try {
    await pool.query(
      `DELETE FROM registrations WHERE event_id = $1 AND user_id = $2`,
      [registrationId, req.user.id]
    );
    res.redirect("/user/registrations");
  } catch (error) {
    console.error("Error canceling registration:", error);
    res.status(500).send("Server error");
  }
};

const getEventDetails = async (req, res) => {
  const { eventId } = req.params;

  try {
    const eventDetailsQuery = `
            SELECT e.name, e.description, e.date, e.time, e.category, e.ticket_price,
            u.first_name || ' ' || u.last_name as organizer_name, l.name as location_name
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            JOIN locations l ON e.location_id = l.id
            WHERE e.id = $1;
        `;
    const result = await pool.query(eventDetailsQuery, [eventId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  updateInterests,
  registerForEvent,
  getUserDashboard,
  getAllEvents,
  cancelRegistration,
  getAllRegistrations,
  getEventDetails,
};
