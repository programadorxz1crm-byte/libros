const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { sendGiftEmail, sendCustomEmail } = require('./utils/email');
const { sendWhatsAppMessage } = require('./utils/whatsapp');
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET } = require('./config');
const { sql, createContactsTable } = require('./utils/db');

// Crear la tabla de contactos al iniciar la aplicación
createContactsTable();
const verifyToken = require('./middleware/auth');
const multer = require('multer');

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
app.post('/api/upload', verifyToken, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: 'No se subieron archivos.' });
  }
  res.status(200).send({ message: 'Archivos subidos correctamente', files: req.files });
});

// Ruta para obtener la lista de contenido
app.get('/api/content', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      // Si el directorio no existe, devolvemos una lista vacía
      if (err.code === 'ENOENT') {
        return res.status(200).json([]);
      }
      return res.status(500).send({ message: 'Error al leer el contenido.' });
    }

    // Ordenar archivos por fecha (el más reciente primero)
    const sortedFiles = files.sort((a, b) => {
      const timeA = parseInt(a.split('-')[0], 10);
      const timeB = parseInt(b.split('-')[0], 10);
      return timeB - timeA;
    });

    const content = sortedFiles.map(file => {
      const extension = path.extname(file).toLowerCase();
      let type = 'file';
      if (['.mp4', '.mov', '.avi'].includes(extension)) {
        type = 'video';
      } else if (['.mp3', '.wav', '.ogg'].includes(extension)) {
        type = 'audio';
      } else if (extension === '.pdf') {
        type = 'pdf';
      }
      return {
        name: file,
        url: `/uploads/${file}`,
        type: type
      };
    });
    res.status(200).json(content);
  });
});

// --- Rutas Públicas ---

app.post('/api/register', async (req, res) => {
  const { name, email, whatsapp } = req.body;

  try {
    // Guardar contacto en la base de datos
    await sql`INSERT INTO contacts (name, email, whatsapp) VALUES (${name}, ${email}, ${whatsapp}) ON CONFLICT (email) DO NOTHING`;

    // Intentar enviar correo y WhatsApp, pero no bloquear el registro si fallan.
    sendGiftEmail(email, name).then(result => {
      if (!result.success) console.error('Error al enviar el correo de bienvenida:', result.error);
    });

    sendWhatsAppMessage(whatsapp, name).then(result => {
      if (!result.success) console.error('Error al enviar el WhatsApp de bienvenida:', result.error);
    });

    // Responder inmediatamente con éxito para que el usuario sea redirigido.
    res.status(200).send({ message: 'Registro procesado.' });

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

// --- Rutas Protegidas de Admin ---

app.get('/api/admin/templates', verifyToken, (req, res) => {
  fs.readFile(TEMPLATES_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send({ message: 'Error al leer las plantillas' });
    }
    res.json(JSON.parse(data));
  });
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
    const { rows } = await sql`SELECT name, email, whatsapp FROM contacts ORDER BY created_at DESC`;
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

app.put('/api/admin/templates', verifyToken, (req, res) => {
  const { email, whatsapp, whatsappApiToken } = req.body;
  if (!email || !whatsapp) { // El token puede ser opcional al principio
    return res.status(400).send({ message: 'Faltan datos de las plantillas' });
  }

  // Leemos el contenido actual para no perder otros campos que puedan existir
  fs.readFile(TEMPLATES_PATH, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') { // Ignoramos si el archivo no existe la primera vez
      return res.status(500).send({ message: 'Error al leer las plantillas existentes' });
    }

    const currentTemplates = data ? JSON.parse(data) : {};
    const newTemplates = JSON.stringify({ ...currentTemplates, email, whatsapp, whatsappApiToken }, null, 2);

    fs.writeFile(TEMPLATES_PATH, newTemplates, 'utf8', (err) => {
      if (err) {
        return res.status(500).send({ message: 'Error al guardar las plantillas' });
      }
      res.send({ message: 'Plantillas y token actualizados correctamente' });
    });
  });
});


app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
