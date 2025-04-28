const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
}; 