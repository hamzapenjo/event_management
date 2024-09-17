const pool = require("../config/database");

const getAllEventTypes = async () => {
  const query = "SELECT * FROM event_types ORDER BY id ASC";
  const result = await pool.query(query);
  return result.rows;
};

const getEventTypeById = async (id) => {
  const query = "SELECT * FROM event_types WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createEventType = async (name, description) => {
  const query =
    "INSERT INTO event_types (name, description) VALUES ($1, $2) RETURNING *";
  const values = [name, description];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateEventType = async (id, name, description) => {
  const query =
    "UPDATE event_types SET name = $1, description = $2 WHERE id = $3 RETURNING *";
  const values = [name, description, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteEventType = async (id) => {
  const query = "DELETE FROM event_types WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
};
