const pool = require("../config/database");

const getCreateEventPage = async (req, res) => {
  try {
    const organizers = await getAllOrganizers();
    const locations = await getAllLocations();
    res.render("admin/create-event", { organizers, locations });
  } catch (error) {
    res.status(500).json({
      message: "Greška pri dohvaćanju podataka za kreiranje događaja.",
      error,
    });
  }
};

const getEvents = async () => {
  try {
    const query = `
      SELECT e.id, e.name as event_name, e.date, e.time, e.category, e.ticket_price, e.organizer_id, l.name as location_name
      FROM events e
      JOIN locations l ON e.location_id = l.id;
    `;
    const result = await pool.query(query);
    console.log(result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching events with location names:", error);
    throw error;
  }
};

const getEventById = async (id) => {
  const query = `SELECT * FROM events WHERE id = $1;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateEvent = async (
  id,
  name,
  description,
  date,
  time,
  category,
  ticket_price,
  location_id
) => {
  const query = `
        UPDATE events
        SET name = $1,
            description = $2,
            date = $3,
            time = $4,
            category = $5,
            ticket_price = $6,
            location_id = $7
        WHERE id = $8
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
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteEvent = async (id) => {
  const query = `DELETE FROM events WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getEventsByInterests = async (interests) => {
  const query = `
        SELECT * FROM events
        WHERE category = ANY($1::text[]);
    `;
  const result = await pool.query(query, [interests]);
  return result.rows;
};

const getEventCount = async () => {
  const query = "SELECT COUNT(*) FROM events";
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

const getEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Događaj nije pronađen." });
    }
    res.render("admin/edit-event", { event });
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju događaja.", error });
  }
};

const createEvent = async (
  name,
  description,
  date,
  time,
  category,
  ticket_price,
  organizer_id,
  location_id
) => {
  const query = `
        INSERT INTO events (name, description, date, time, category, ticket_price, organizer_id, location_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
  const values = [
    name,
    description,
    date,
    time,
    category,
    ticket_price,
    organizer_id,
    location_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getEventsByCategory = async () => {
  const result = await pool.query(`
        SELECT category, COUNT(*) as count 
        FROM events 
        GROUP BY category
    `);

  const eventsByCategory = {};

  result.rows.forEach((row) => {
    eventsByCategory[row.category.toLowerCase()] = parseInt(row.count, 10);
  });

  return eventsByCategory;
};

const getTotalEventsByOrganizer = async (organizer_id) => {
  const query = "SELECT COUNT(*) FROM events WHERE organizer_id = $1";
  const result = await pool.query(query, [organizer_id]);
  return parseInt(result.rows[0].count, 10);
};

const getTotalRegistrationsByOrganizer = async (organizer_id) => {
  const query = `
        SELECT COUNT(*) 
        FROM registrations 
        WHERE event_id IN (SELECT id FROM events WHERE organizer_id = $1)`;
  const result = await pool.query(query, [organizer_id]);
  return parseInt(result.rows[0].count, 10);
};

const getApprovedRegistrationsByOrganizer = async (organizer_id) => {
  const query = `
        SELECT COUNT(*) 
        FROM registrations 
        WHERE status = 'approved' 
        AND event_id IN (SELECT id FROM events WHERE organizer_id = $1)`;
  const result = await pool.query(query, [organizer_id]);
  return parseInt(result.rows[0].count, 10);
};

const getRejectedRegistrationsByOrganizer = async (organizer_id) => {
  const query = `
        SELECT COUNT(*) 
        FROM registrations 
        WHERE status = 'rejected' 
        AND event_id IN (SELECT id FROM events WHERE organizer_id = $1)`;
  const result = await pool.query(query, [organizer_id]);
  return parseInt(result.rows[0].count, 10);
};

const getRecentEventsByOrganizer = async (organizer_id) => {
  const query = `
        SELECT id, name, date
        FROM events
        WHERE organizer_id = $1
        ORDER BY date DESC
        LIMIT 5;
    `;
  const values = [organizer_id];
  const result = await pool.query(query, values);
  return result.rows;
};

const getEventsByOrganizer = async (organizerId) => {
  const query = `
        SELECT events.id, events.name, events.date, events.category, locations.name as location_name
        FROM events
        JOIN locations ON events.location_id = locations.id
        WHERE events.organizer_id = $1;
    `;
  const result = await pool.query(query, [organizerId]);
  return result.rows;
};

module.exports = {
  getCreateEventPage,
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByInterests,
  getEventCount,
  getEvent,
  getEventsByCategory,
  getTotalEventsByOrganizer,
  getTotalRegistrationsByOrganizer,
  getApprovedRegistrationsByOrganizer,
  getRejectedRegistrationsByOrganizer,
  getRecentEventsByOrganizer,
  getEventsByOrganizer,
};
