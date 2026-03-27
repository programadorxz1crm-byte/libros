const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const TEMPLATES_PATH = path.join(__dirname, '../templates.json');

// ATENCIÓN: Reemplazar con los datos correctos del servidor SMTP
const transporter = nodemailer.createTransport({
  host: 'mail.spacemail.com', // <-- Por favor, confirma si este es el host SMTP
  port: 465, // <-- Por favor, confirma si este es el puerto SMTP (normalmente 465 para SSL o 587 para TLS)
  secure: true, // true para el puerto 465
  auth: {
    user: 'libro@angelessagrado.shop',
    pass: 'g(8ypCp1', // La contraseña que me proporcionaste
  },
  tls: {
    // No fallar en certificados autofirmados (común en algunos hostings)
    rejectUnauthorized: false,
  },
});

const sendGiftEmail = async (to, name) => {
  try {
    const templatesData = fs.readFileSync(TEMPLATES_PATH, 'utf8');
    const templates = JSON.parse(templatesData);
    const emailHtml = templates.email.replace(/\${name}/g, name);

    const mailOptions = {
      from: '"Ángeles Sagrados" <libro@angelessagrado.shop>',
      to: to,
      subject: '🎁 Tu Regalo de Ángeles Sagrados',
      html: emailHtml,
      // TODO: Añadir los mandalas como archivos adjuntos cuando estén disponibles
      // attachments: [
      //   { filename: 'mandala1.pdf', path: 'ruta/al/mandala1.pdf' },
      //   { filename: 'mandala2.pdf', path: 'ruta/al/mandala2.pdf' },
      //   { filename: 'mandala3.pdf', path: 'ruta/al/mandala3.pdf' },
      // ],
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error };
  }
};

module.exports = { sendGiftEmail };
