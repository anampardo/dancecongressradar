const pool = require('./db');

async function testConexion() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado a Supabase correctamente:', res.rows[0]);
  } catch (err) {
    console.error('Error al conectar a Supabase:', err);
  }
}

testConexion();
