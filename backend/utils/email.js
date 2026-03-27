const nodemailer = require('nodemailer');
const { sql } = require('@vercel/postgres');

// ATENCIÓN: Reemplazar con los datos correctos del servidor SMTP
const transporter = nodemailer.createTransport({
  host: 'mail.spacemail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'libro@angelessagrado.shop',
    pass: 'g(8ypCp1',
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: true, // Habilitar log de depuración
  logger: true // Loguear la conexión en la consola
});

const sendGiftEmail = async (recipientEmail, recipientName) => {
  try {
    const { rows } = await sql`SELECT email_template FROM templates WHERE id = 1`;
    if (rows.length === 0) {
      throw new Error('No se encontró la plantilla de correo en la base de datos.');
    }
    const emailHtml = rows[0].email_template.replaceAll('${name}', recipientName);

    const subject = '🎁 ¡Tu Regalo Especial de Ángeles Sagrados!';
    return await sendCustomEmail(recipientEmail, subject, emailHtml);

  } catch (error) {
    console.error('Error al leer o procesar la plantilla de correo desde la BD:', error);
    // Fallback a un correo genérico si la plantilla falla
    const fallbackHtml = `
      <h1>¡Hola, ${recipientName}!</h1>
      <p>Gracias por registrarte. Accede a tus regalos aquí:</p>
      <a href="https://libros-mu.vercel.app/dashboard">Acceder a mis regalos</a>
    `;
    return await sendCustomEmail(recipientEmail, '🎁 ¡Tu Regalo Especial de Ángeles Sagrados!', fallbackHtml);
  }
};

const sendCustomEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Ángeles Sagrados" <libro@angelessagrado.shop>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado a:', to);
    return { success: true };
  } catch (error) {
    console.error('Error detallado al enviar el correo:', error);
    return { success: false, error };
  }
};

module.exports = { sendGiftEmail, sendCustomEmail };
