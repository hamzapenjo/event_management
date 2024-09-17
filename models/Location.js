const pool = require("../config/database");

const getLocationsFromDb = async () => {
  const query = "SELECT * FROM locations";
  const result = await pool.query(query);
  return result.rows;
};

const createLocationInDb = async (name, address, city, country) => {
  const query =
    "INSERT INTO locations (name, address, city, country) VALUES ($1, $2, $3, $4)";
  await pool.query(query, [name, address, city, country]);
};

const getLocationByIdFromDb = async (id) => {
  const query = "SELECT * FROM locations WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateLocationInDb = async (id, name, address, city, country) => {
  const query =
    "UPDATE locations SET name = $1, address = $2, city = $3, country = $4 WHERE id = $5";
  await pool.query(query, [name, address, city, country, id]);
};

const deleteLocationInDb = async (id) => {
  const query = "DELETE FROM locations WHERE id = $1";
  await pool.query(query, [id]);
};

const getAllLocations = async () => {
  const query = `SELECT id, name FROM locations;`;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getLocationsFromDb,
  createLocationInDb,
  getLocationByIdFromDb,
  updateLocationInDb,
  deleteLocationInDb,
  getAllLocations,
};
