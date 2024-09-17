const pool = require("../config/database");

const {
  getEventsByOrganizer,
  getRecentEventsByOrganizer,
  getTotalEventsByOrganizer,
  getTotalRegistrationsByOrganizer,
  getApprovedRegistrationsByOrganizer,
  getRejectedRegistrationsByOrganizer,
  createEvent,
  deleteEvent,
} = require("../models/Event");

const getOrganizerDashboard = async (req, res) => {
  try {
    const organizer_id = req.user.id;

    const totalEvents = await getTotalEventsByOrganizer(organizer_id);
    const totalRegistrations = await getTotalRegistrationsByOrganizer(
      organizer_id
    );
    const approvedRegistrations = await getApprovedRegistrationsByOrganizer(
      organizer_id
    );
    const rejectedRegistrations = await getRejectedRegistrationsByOrganizer(
      organizer_id
    );

    const recentEvents = await getRecentEventsByOrganizer(organizer_id);

    res.render("organizer/dashboard", {
      totalEvents,
      totalRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      recentEvents,
    });
  } catch (error) {
    console.error(
      "Greška pri dohvaćanju podataka za organizatorov dashboard:",
      error
    );
    res.status(500).send("Greška pri dohvaćanju podataka.");
  }
};

const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const events = await getEventsByOrganizer(organizerId);
    res.render("organizer/events", { events });
  } catch (error) {
    res.status(500).json({
      message: "Greška pri dohvaćanju događaja za organizatora.",
      error,
    });
  }
};

const getCreateEventPage = async (req, res) => {
  try {
    const locations = await pool.query("SELECT * FROM locations");
    console.log("Dohvaćene lokacije:", locations.rows);
    res.render("organizer/create-event", { locations: locations.rows });
  } catch (error) {
    console.error(
      "Greška pri dohvaćanju podataka za kreiranje događaja:",
      error
    );
    res.status(500).json({
      message: "Greška pri dohvaćanju podataka za kreiranje događaja.",
      error,
    });
  }
};

const createOrganizerEvent = async (req, res) => {
  const { name, description, date, time, category, ticket_price, location_id } =
    req.body;
  const organizer_id = req.user.id;

  try {
    const newEvent = await createEvent(
      name,
      description,
      date,
      time,
      category,
      ticket_price,
      organizer_id,
      location_id
    );
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Greška pri kreiranju događaja.", error });
  }
};

const getEditEventPage = async (req, res) => {
  const { id } = req.params;

  try {
    const eventQuery =
      "SELECT * FROM events WHERE id = $1 AND organizer_id = $2";
    const eventResult = await pool.query(eventQuery, [id, req.user.id]);

    const locationsQuery = "SELECT * FROM locations";
    const locationsResult = await pool.query(locationsQuery);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    const event = eventResult.rows[0];
    const locations = locationsResult.rows;

    res.render("organizer/edit-event", { event, locations });
  } catch (error) {
    console.error("Error fetching event data for edit:", error);
    res.status(500).json({ message: "Error fetching event data for edit." });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, date, time, category, ticket_price, location_id } =
    req.body;

  try {
    const query = `
            UPDATE events
            SET name = $1,
                description = $2,
                date = $3,
                time = $4,
                category = $5,
                ticket_price = $6,
                location_id = $7
            WHERE id = $8 AND organizer_id = $9
            RETURNING *;
        `;
    const values = [
      name,
      description,
      date,
      time,
      category,
      ticket_price,
      location_id,
      id,
      req.user.id,
    ];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Event not found or not authorized to edit." });
    }

    res
      .status(200)
      .json({ message: "Event updated successfully!", event: result.rows[0] });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event." });
  }
};

const deleteExistingEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEvent = await deleteEvent(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Događaj nije pronađen." });
    }
    res.status(200).json({ message: "Događaj je obrisan." });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju događaja.", error });
  }
};

const getRegistrationsByOrganizer = async (req, res) => {
  const organizerId = req.user.id;

  try {
    const registrations = await pool.query(
      `SELECT r.id, r.status, e.name as event_name, e.date, u.first_name, u.last_name
         FROM registrations r
         JOIN events e ON r.event_id = e.id
         JOIN users u ON r.user_id = u.id
         WHERE e.organizer_id = $1`,
      [organizerId]
    );
    res.render("organizer/registrations", {
      registrations: registrations.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching registrations");
  }
};

const updateRegistrationStatus = async (req, res) => {
  const { id: registrationId } = req.params;
  const { newStatus } = req.body;

  try {
    const result = await pool.query(
      `UPDATE registrations SET status = $1 WHERE id = $2 RETURNING *`,
      [newStatus, registrationId]
    );
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: "Registration status updated successfully",
        registration: result.rows[0],
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Registration not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating registration status",
        error,
      });
  }
};

const updateEventStatus = async (req, res) => {
  const { id: eventId } = req.params;
  const { newStatus } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET status = $1 WHERE id = $2 RETURNING *`,
      [newStatus, eventId]
    );
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: "Event status updated successfully",
        event: result.rows[0],
      });
    } else {
      res.status(404).json({ success: false, message: "Event not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating event status", error });
  }
};

const getNotifications = async (req, res) => {
  const organizerId = req.user.id;
  try {
    const notifications = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 AND seen = false`,
      [organizerId]
    );

    res.json({ notifications: notifications.rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCreateEventPage,
  getOrganizerDashboard,
  getOrganizerEvents,
  createOrganizerEvent,
  getEditEventPage,
  updateEvent,
  deleteExistingEvent,
  updateRegistrationStatus,
  getRegistrationsByOrganizer,
  updateEventStatus,
  getNotifications,
};
