const pool = require('../config/database');

const getTotalUsers = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
};

const getTotalOrganizers = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'organizer\'');
    return parseInt(result.rows[0].count, 10);
};

const getTotalAdmins = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE role = \'admin\'');
    return parseInt(result.rows[0].count, 10);
};

const getTotalEvents = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM events');
    return parseInt(result.rows[0].count, 10);
};

const getTotalRegistrations = async () => {
    const result = await pool.query('SELECT COUNT(*) FROM registrations');
    return parseInt(result.rows[0].count, 10);
};

const getRecentUsers = async () => {
    const result = await pool.query('SELECT first_name, last_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    return result.rows;
};


module.exports = {
    getTotalUsers,
    getTotalOrganizers,
    getTotalAdmins,
    getTotalEvents,
    getTotalRegistrations,
    getRecentUsers
};
