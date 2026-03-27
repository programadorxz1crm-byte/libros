const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { sendGiftEmail } = require('./utils/email');
const { sendWhatsAppMessage } = require('./utils/whatsapp');
const { ADMIN_USERNAME, ADMIN_PASSWORD_HASH, JWT_SECRET } = require('./config');
const verifyToken = require('./middleware/auth');

const app = express();
const port = 3001;
const TEMPLATES_PATH = path.join(__dirname, 'templates.json');

const CONTACTS_PATH = path.join(__dirname, 'contacts.json');

app.use(cors());
app.use(express.json());

// --- Rutas Públicas ---

app.post('/api/register', async (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { name, email, whatsapp } = req.body;

  // Guardar contacto
  fs.readFile(CONTACTS_PATH, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return console.error('Error al leer los contactos.');
    }
    const contacts = data ? JSON.parse(data) : [];
    // Evitar duplicados
    if (!contacts.some(contact => contact.whatsapp === whatsapp)) {
      contacts.push({ name, whatsapp });
      fs.writeFile(CONTACTS_PATH, JSON.stringify(contacts, null, 2), (err) => {
        if (err) return console.error('Error al guardar el contacto.');
        console.log('Nuevo contacto guardado:', { name, whatsapp });
      });
    }
  });

  const emailResult = await sendGiftEmail(email, name);
  if (!emailResult.success) {
    return res.status(500).send({ message: 'Error al enviar el correo', error: emailResult.error });
  }

  const whatsappResult = await sendWhatsAppMessage(whatsapp, name);
  if (!whatsappResult.success) {
    console.error('El mensaje de WhatsApp no se pudo enviar, pero el correo sí.');
    return res.status(200).send({ 
      message: 'Datos recibidos y correo enviado, pero hubo un problema con WhatsApp.', 
      whatsapp_error: whatsappResult.error 
    });
  }

  res.status(200).send({ message: 'Datos recibidos, correo y WhatsApp enviados correctamente' });
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

app.get('/api/admin/contacts', verifyToken, (req, res) => {
  fs.readFile(CONTACTS_PATH, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { // Si el archivo no existe, devolvemos una lista vacía
        return res.json([]);
      }
      return res.status(500).send({ message: 'Error al leer los contactos' });
    }
    res.json(JSON.parse(data));
  });
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
