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

const sendGiftEmail = async (recipientEmail, recipientName) => {
  const subject = '🎁 ¡Tu Regalo Especial de Ángeles Sagrados!';
  const html = `
    <h1>¡Hola, ${recipientName}!</h1>
    <p>Gracias por registrarte. Como prometimos, aquí tienes tu regalo especial.</p>
    <p>Accede a tu contenido exclusivo haciendo clic en el siguiente enlace:</p>
    <a href="https://libros-mu.vercel.app/dashboard">Acceder a mis regalos</a>
    <p>Con amor y luz,</p>
    <p>El equipo de Ángeles Sagrados</p>
  `;
  return await sendCustomEmail(recipientEmail, subject, html);
};

const sendCustomEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Ángeles Sagrados" <${EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return { success: false, error };
  }
};

module.exports = { sendGiftEmail, sendCustomEmail };
