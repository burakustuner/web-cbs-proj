const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'gisuser',
  password: process.env.DB_PASSWORD || 'gispass',
  database: process.env.DB_NAME || 'gisdb',
});

module.exports = pool;
