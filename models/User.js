const pool = require("../config/database");
const bcrypt = require("bcrypt");

const createUser = async (
  first_name,
  last_name,
  email,
  password,
  role,
  interests
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `INSERT INTO users (first_name, last_name, email, password, role, interests) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [
    first_name,
    last_name,
    email,
    hashedPassword,
    role,
    interests,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `SELECT id, first_name, last_name, email, status FROM users ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const updateUserInterestsInModel = async (user_id, interests) => {
  const query = `
        UPDATE users
        SET interests = $1
        WHERE id = $2
        RETURNING *;
    `;
  const values = [interests, user_id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateUserStatusInModel = async (id, status, blockUntil) => {
  const query = `
        UPDATE users
        SET status = $1, block_until = $2
        WHERE id = $3
        RETURNING *;
    `;
  const values = [status, blockUntil || null, id];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new Error("User not found or no changes made.");
  }
  return result.rows[0];
};

const getUserCount = async () => {
  const query = `SELECT COUNT(*) FROM users`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

const getUserById = async (id) => {
  const query =
    "SELECT id, first_name, last_name, email, status FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

const deleteUserById = async (id) => {
  const query = "DELETE FROM users WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  return result.rows[0];
};

const updateUserInModel = async (
  id,
  first_name,
  last_name,
  email,
  status,
  block_until
) => {
  const query = `
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, status = $4, block_until = $5
      WHERE id = $6
      RETURNING *;
    `;
  const values = [
    first_name,
    last_name,
    email,
    status,
    block_until || null,
    id,
  ];
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

const createUserInModel = async (
  first_name,
  last_name,
  email,
  password,
  role,
  status
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
      INSERT INTO users (first_name, last_name, email, password, role, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
  const values = [first_name, last_name, email, hashedPassword, role, status];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const getUsersByRole = async (role) => {
  const query = `SELECT id, first_name, last_name FROM users WHERE role = $1`;
  const result = await pool.query(query, [role]);
  return result.rows;
};

const getAllOrganizers = async () => {
  const query = `SELECT id, first_name, last_name FROM users WHERE role = 'organizer';`;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  updateUserInterestsInModel,
  updateUserStatusInModel,
  getUserCount,
  getUserById,
  deleteUserById,
  updateUserInModel,
  createUserInModel,
  getUsersByRole,
  getAllOrganizers,
};
