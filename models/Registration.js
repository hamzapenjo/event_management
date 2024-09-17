const pool = require("../config/database");

const registerForEvent = async (user_id, event_id) => {
  const query = `
        INSERT INTO registrations (user_id, event_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *;
    `;
  const values = [user_id, event_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getRegistrationsForEvent = async (event_id) => {
  const query = `SELECT * FROM registrations WHERE event_id = $1;`;
  const result = await pool.query(query, [event_id]);
  return result.rows;
};

const updateRegistrationStatus = async (id, status) => {
  const query = `
        UPDATE registrations
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;
  const values = [status, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  registerForEvent,
  getRegistrationsForEvent,
  updateRegistrationStatus,
};
