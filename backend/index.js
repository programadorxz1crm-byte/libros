// Forzando un redespliegue para limpiar la caché de Vercel
// Forzando un redespliegue para limpiar la caché de Vercel
// Forzando un redespliegue para limpiar la caché de Vercel
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { sendGiftEmail, sendCustomEmail } = require('./utils/email');
const { sendWhatsAppMessage } = require('./utils/whatsapp');
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET } = require('./config');
const { sql, createContactsTable, createTemplatesTable } = require('./utils/db');
const { put, list, del } = require('@vercel/blob');

// Crear las tablas de la base de datos al iniciar la aplicación
(async () => {
  await createContactsTable();
  await createTemplatesTable();
})();
const verifyToken = require('./middleware/auth');
const multer = require('multer');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const CONTACTS_PATH = path.join(__dirname, 'contacts.json');
const TEMPLATES_PATH = path.join(__dirname, 'templates.json');
const SETTINGS_PATH = path.join(__dirname, 'settings.json');

// Configuración de Multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ... (el resto de tu configuración de Express)

// Ruta para subir archivos (protegida para admin)
app.post('/api/upload', verifyToken, async (req, res) => {
  if (!req.body) {
    return res.status(400).send('No se subieron archivos.');
  }
  const { filename, body } = req.body;
  const blob = await put(filename, body, { access: 'public' });
  res.status(200).json(blob);
});

app.get('/api/files', verifyToken, async (req, res) => {
  const { blobs } = await list();
  res.status(200).json(blobs);
});

app.delete('/api/files', verifyToken, async (req, res) => {
  const { urls } = req.body;
  await del(urls);
  res.status(200).send('Archivos eliminados');
});

// Ruta para obtener la lista de contenido
app.get('/api/user/content', async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ message: 'No autorizado.' });
  }
  const token = authorization.split(' ')[1];
  const { rows } = await sql`SELECT id FROM contacts WHERE auth_token = ${token}`;
  if (rows.length === 0) {
    return res.status(401).send({ message: 'No autorizado.' });
  }

  const { blobs } = await list();
  const content = blobs.map(blob => ({
    name: blob.pathname.replace(/^\//, ''),
    url: blob.url,
    type: blob.pathname.split('.').pop()
  }));
  res.status(200).json(content);
});

// --- Rutas Públicas ---

app.post('/api/register', async (req, res) => {
  const { name, email, whatsapp } = req.body;

  try {
    // 1. Ensure table exists and insert contact
    await createContactsTable();
    const result = await sql`INSERT INTO contacts (name, email, whatsapp) VALUES (${name}, ${email}, ${whatsapp}) ON CONFLICT (email) DO NOTHING`;

    // Siempre intentar enviar las notificaciones
    console.log(`Procesando registro para: ${email}. Enviando notificaciones...`);
    await sendGiftEmail(email, name);
    await sendWhatsAppMessage(whatsapp, name);
    console.log(`Notificaciones enviadas para: ${email}`);

    // 3. Respond with success
    res.status(200).send({ message: 'Registro procesado con éxito.' });

  } catch (error) {
    console.error('Error en el proceso de registro:', error);
    res.status(500).send({ message: 'Hubo un error interno al procesar tu registro.' });
  }
});

// --- Rutas de Admin ---

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = jwt.sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ message: 'El correo es obligatorio.' });
  }
  try {
    const { rows } = await sql`SELECT id, name, email, whatsapp, profile_picture_url, auth_token FROM contacts WHERE email = ${email}`;
    if (rows.length === 0) {
      return res.status(404).send({ message: 'El correo no está registrado.' });
    }
    // En un futuro, aquí se podría enviar un email con un enlace de login
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en el login de usuario:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
});

app.put('/api/user/profile', async (req, res) => {
  const { token, name, whatsapp } = req.body;
  if (!token) {
    return res.status(401).send({ message: 'No autorizado.' });
  }
  try {
    await sql`UPDATE contacts SET name = ${name}, whatsapp = ${whatsapp} WHERE auth_token = ${token}`;
    res.status(200).send({ message: 'Perfil actualizado.' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/user/profile-picture', async (req, res) => {
  const { token, filename, body } = req.body;
  if (!token || !filename || !body) {
    return res.status(400).send({ message: 'Faltan datos.' });
  }
  try {
    const blob = await put(filename, body, { access: 'public' });
    await sql`UPDATE contacts SET profile_picture_url = ${blob.url} WHERE auth_token = ${token}`;
    res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Error al subir la foto de perfil:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
});

// --- Rutas Protegidas de Admin ---

app.get('/api/admin/templates', verifyToken, async (req, res) => {
  try {
    const { rows } = await sql`SELECT email_template, whatsapp_template FROM templates WHERE id = 1`;
    if (rows.length === 0) {
      return res.status(404).send({ message: 'No se encontraron plantillas.' });
    }
    res.json({ email: rows[0].email_template, whatsapp: rows[0].whatsapp_template });
  } catch (error) {
    console.error('Error al obtener las plantillas:', error);
    res.status(500).send({ message: 'Error al leer las plantillas' });
  }
});

app.post('/api/admin/send-email', verifyToken, async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).send({ message: 'Faltan datos: se requiere destinatario, asunto y cuerpo del correo.' });
  }

  const result = await sendCustomEmail(to, subject, body);

  if (result.success) {
    res.status(200).send({ message: 'Correo enviado correctamente.' });
  } else {
    res.status(500).send({ message: 'Error al enviar el correo.', error: result.error });
  }
});

app.get('/api/admin/contacts', verifyToken, async (req, res) => {
  try {
    const { rows } = await sql`SELECT name, email, whatsapp, profile_picture_url FROM contacts ORDER BY created_at DESC`;
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los contactos:', error);
    res.status(500).send({ message: 'Error al leer los contactos' });
  }
});

// Rutas para la configuración del video de bienvenida
app.get('/api/settings', (req, res) => {
  // Devuelve la URL desde la variable de entorno
  res.status(200).json({ welcomeVideoUrl: process.env.WELCOME_VIDEO_URL || '' });
});

app.post('/api/admin/bulk-whatsapp', verifyToken, async (req, res) => {
  const { numbers, message } = req.body;

  if (!numbers || !message || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).send({ message: 'Faltan datos: se requiere una lista de números y un mensaje.' });
  }

  console.log(`Iniciando envío masivo a ${numbers.length} números.`);

  const results = [];
  // Usamos un bucle for...of para asegurar que los envíos se hagan secuencialmente y no sobrecargar la API
  for (const number of numbers) {
    // Aquí no tenemos el nombre, así que enviamos un mensaje genérico.
    // Podríamos adaptar la lógica si quisiéramos personalizarlo, buscando el nombre en contacts.json
    const result = await sendWhatsAppMessage(number, '' /* Sin nombre para mensaje masivo */);
    results.push({ number, success: result.success });
    // Opcional: añadir una pequeña pausa entre mensajes para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 segundos de pausa
  }

  const successes = results.filter(r => r.success).length;
  const failures = results.length - successes;

  console.log(`Envío masivo completado. Éxitos: ${successes}, Fallos: ${failures}`);

  res.status(200).send({ 
    message: `Proceso de envío masivo completado.`,
    successes,
    failures,
    results
  });
});

app.post('/api/admin/templates', verifyToken, async (req, res) => {
  const { email, whatsapp } = req.body;
  try {
    await sql`
      UPDATE templates
      SET email_template = ${email}, whatsapp_template = ${whatsapp}
      WHERE id = 1;
    `;
    res.status(200).send({ message: 'Plantillas guardadas correctamente en la base de datos.' });
  } catch (error) {
    console.error('Error al guardar las plantillas:', error);
    res.status(500).send({ message: 'Error al guardar las plantillas' });
  }
});


app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
