const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TEMPLATES_PATH = path.join(__dirname, '../templates.json');

// ATENCIÓN: Reemplazar con tu token de autorización real
const sendWhatsAppMessage = async (number, name) => {
  try {
    const templatesData = fs.readFileSync(TEMPLATES_PATH, 'utf8');
    const templates = JSON.parse(templatesData);
    
    const WHATSAPP_API_TOKEN = templates.whatsappApiToken;
    if (!WHATSAPP_API_TOKEN) {
      throw new Error('El token de la API de WhatsApp no está configurado.');
    }

    const messageBody = name 
      ? templates.whatsapp.replace(/\${name}/g, name) 
      : templates.whatsapp; // Si no hay nombre, usamos la plantilla tal cual (para envíos masivos)

    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        number: number,
        body: messageBody,
        sendSignature: true,
        closeTicket: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta de la API de WhatsApp:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al enviar el mensaje de WhatsApp:', error.response ? error.response.data : error.message);
    return { success: false, error: error.response ? error.response.data : error.message };
  }
};

module.exports = { sendWhatsAppMessage };
