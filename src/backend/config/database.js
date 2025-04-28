const { Pool } = require('pg');
const config = require('./config');

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = { pool: dbPool }; 