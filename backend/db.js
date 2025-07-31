const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       // tu usuario de PostgreSQL
  host: 'db.pvfjjggnpjyulgjgonsf.supabase.co',
  database: 'postgres',  // nombre de tu base de datos
  password: '25N&iVTGDPdhh%3',          // tu contraseña
  port: 5432,
  ssl: {
    rejectUnauthorized: false       // <- necesario para conexión segura con Supabase
  }
});

module.exports = pool;

