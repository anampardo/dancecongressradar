const express = require('express');
const app = express();

const cors = require('cors');
const pool = require('./db');
const session = require('express-session');
const bcrypt = require('bcrypt');
const expressLayouts = require('express-ejs-layouts');
const PORT = 3000;

// EJS y Layouts
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs sin extensión

//Middleware
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',  // 👈 Tu frontend (live-server)
  credentials: true                // 👈 Permitir el uso de cookies
}));


app.use(session({
  secret: 'clave_segura', // Cámbiala por algo más seguro
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,           // 👈 Debe ser false si NO usas HTTPS
    sameSite: 'lax'          // 👈 Permite que se comparta entre dominios locales
   } // Si usas HTTPS, cambia a true
}));

// Ruta simple para testear conexión
app.get('/', (req, res) => {
  res.send('DanceCongressRadar backend funcionando');
});

// Ruta para obtener todos los eventos con ciudad y país
app.get('/pais', async (req, res) => {
  try {
    const pais = await pool.query(`
      Select 
	    p.nombre AS pais, c.nombre AS ciudad
        From ciudad c
       JOIN pais p ON c.id_pais = p.id
        ORDER BY p.nombre, c.nombre
    `);
    res.json(pais.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/estilos', async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT id, nombre FROM estilo ORDER BY nombre`);
    res.json(resultado.rows);
  } catch (err) {
    console.error('Error al obtener estilos:', err.message);
    res.status(500).send('Error en el servidor');
  }
});


app.post('/eventos', async (req, res) => {
  const client = await pool.connect();

  try {
    const { nombre, fecha_inicio, fecha_fin, web, ciudad, estilos } = req.body;

    // Buscar el ID de la ciudad
    const ciudadRes = await client.query(
      `SELECT id FROM ciudad WHERE nombre = $1 LIMIT 1`,
      [ciudad]
    );

    if (ciudadRes.rows.length === 0) {
      return res.status(400).json({ error: 'Ciudad no encontrada' });
    }

    const id_ciudad = ciudadRes.rows[0].id;

    // Insertar evento
    const insertEvento = await client.query(
      `INSERT INTO evento (nombre, fecha_inicio, fecha_fin, enlace_web, id_ciudad)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [nombre, fecha_inicio, fecha_fin, web, id_ciudad]
    );

    const id_evento = insertEvento.rows[0].id;

    // Insertar estilos relacionados
    for (const id_estilo of estilos) {
      await client.query(
        `INSERT INTO evento_estilo (id_evento, id_estilo) VALUES ($1, $2)`,
        [id_evento, id_estilo]
      );
    }

    res.status(201).json({ mensaje: 'Evento guardado exitosamente' });

  } catch (err) {
    console.error('Error al guardar evento:', err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    client.release();
  }
});


app.get('/eventos', async (req, res) => {
  try {
    const { pais, ciudad, estilo, desde, hasta } = req.query;

    let baseQuery = `
      SELECT 
        e.id AS id_evento,
        e.nombre AS nombre_evento,
        e.fecha_inicio,
        e.fecha_fin,
        e.enlace_web,
        c.nombre AS ciudad,
        p.nombre AS pais,
        ARRAY_AGG(es.nombre) AS estilos
      FROM evento e
      JOIN ciudad c ON e.id_ciudad = c.id
      JOIN pais p ON c.id_pais = p.id
      LEFT JOIN evento_estilo ee ON ee.id_evento = e.id
      LEFT JOIN estilo es ON es.id = ee.id_estilo
      WHERE e.fecha_fin >= CURRENT_DATE
    `;

    const params = [];
    let i = 1;

    if (pais) {
      baseQuery += ` AND p.nombre = $${i++}`;
      params.push(pais);
    }

    if (ciudad) {
      baseQuery += ` AND c.nombre = $${i++}`;
      params.push(ciudad);
    }

    if (desde) {
      baseQuery += ` AND e.fecha_inicio >= $${i++}`;
      params.push(desde);
    }

    if (hasta) {
      baseQuery += ` AND e.fecha_fin <= $${i++}`;
      params.push(hasta);
    }

    baseQuery += `
      GROUP BY e.id, e.nombre, e.fecha_inicio, e.fecha_fin, e.enlace_web, c.nombre, p.nombre
      ORDER BY e.fecha_inicio ASC
    `;

    let resultado = await pool.query(baseQuery, params);
    let eventos = resultado.rows;

    // Filtro manual por estilo si se indicó
    if (estilo) {
      eventos = eventos.filter(ev => ev.estilos.includes(estilo));
    }

    res.json(eventos);
  } catch (err) {
    console.error('Error al filtrar eventos:', err.message);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const resultado = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = resultado.rows[0];
    const esValido = await bcrypt.compare(password, usuario.password_hash);

    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    req.session.usuarioId = usuario.id;
    res.json({ mensaje: 'Login exitoso' });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/verificar', (req, res) => {
  if (req.session.usuarioId) {
    res.json({ logueado: true });
  } else {
    res.status(401).json({ logueado: false });
  }
});



//mantener de ultimo
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});