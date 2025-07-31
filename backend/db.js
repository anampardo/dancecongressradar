const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       // tu usuario de PostgreSQL
  host: 'localhost',
  database: 'dance_congress_radar',  // nombre de tu base de datos
  password: 'admin123',          // tu contraseña
  port: 5432,
});

module.exports = pool;
