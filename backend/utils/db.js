const { sql } = require('@vercel/postgres');

const createContactsTable = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        whatsapp VARCHAR(50),
        profile_picture_url TEXT,
        auth_token UUID DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // Add new columns if they don't exist for backward compatibility
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS auth_token UUID;`;

    console.log('Tabla de contactos verificada/actualizada con éxito.');
  } catch (error) {
    console.error('Error al crear/actualizar la tabla de contactos:', error);
  }
};

const createTemplatesTable = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id INT PRIMARY KEY,
        email_template TEXT,
        whatsapp_template TEXT
      );
    `;
    // Ensure there is always one row for templates
    await sql`
      INSERT INTO templates (id, email_template, whatsapp_template)
      VALUES (1, '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #4A4A4A; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F4F1F8;"><div style="background-color: #FFFFFF; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);"><h1 style="font-family: \'Playfair Display\', serif; color: #A084C4; text-align: center;">🎁 PORTAL DE BIENVENIDA: ÁNGELES SAGRADOS 🎁</h1><hr style="border: 0; border-top: 1px solid #EAEAEA; margin: 30px 0;"><h2 style="font-family: \'Playfair Display\', serif; color: #A084C4;">📑 PARTE 2: Guía del PDF "Tu Ritual, Tus Reglas"</h2><p><strong>✨ 1. Encuentra tu Momento</strong><br>No busques el "momento perfecto", busca <strong>tu</strong> momento. Puede ser con un café por la mañana o antes de dormir para soltar el día. Este es tu espacio sagrado donde el mundo exterior no tiene permiso de entrar.</p><p><strong>🧘 2. Escucha, Visualiza y Siente</strong><br>Antes de tocar el papel, escanea el QR y dale play a tu Meditación. Una vez que la frecuencia del código esté activa en ti, lee la frase de tu mandala, cierra tus ojos por un instante y permite que tu intuición elija el primer color. No estás pintando un dibujo, estás coloreando una intención que ya es real.</p><p><strong>🔢 3. La Melodía de los Números</strong><br>Cada mandala viene con un Código Sagrado. No necesitas entenderlo racionalmente; solo deja que su vibración trabaje en tu subconsciente mientras pintas. Es una melodía divina que ajusta tu energía para que la abundancia te encuentre fácilmente.</p><p><strong>🌈 4. Sin Juicios, Solo Gozo</strong><br>¿Te saliste de la raya? Está bien. ¿Usaste colores que "no combinan"? Está bien. Tu alma no conoce de perfección, solo de expresión. Al terminar, observa tu obra y di: "Esto es parte de mi nueva realidad. Gracias".</p><hr style="border: 0; border-top: 1px solid #EAEAEA; margin: 30px 0;"><h2 style="font-family: \'Playfair Display\', serif; color: #A084C4;">🎁 PARTE 3: Tus Regalos Extra</h2><p>Aquí tienes 3 mandalas adicionales para imprimir:</p><div style="margin-top: 20px;"><h4>BONUS: Puerta de Oportunidades</h4><p><em>"Me abro a recibir con gratitud infinita todo lo que el universo tiene preparado para mí".</em></p><p style="text-align:center; font-weight:bold; color:#A084C4;">[MANDALA CON QR AQUÍ]</p></div><div style="margin-top: 20px;"><h4>BONUS: Jardín Próspero</h4><p><em>"Nutro mis ideas y mis acciones para que florezcan en abundancia y éxito".</em></p><p style="text-align:center; font-weight:bold; color:#A084C4;">[MANDALA CON QR AQUÍ]</p></div><div style="margin-top: 20px;"><h4>BONUS: Estrella de Riqueza</h4><p><em>"Mi luz guía mi camino hacia experiencias de máximo bienestar y prosperidad".</em></p><p style="text-align:center; font-weight:bold; color:#A084C4;">[MANDALA CON QR AQUÍ]</p></div><hr style="border: 0; border-top: 1px solid #EAEAEA; margin: 30px 0;"><h2 style="font-family: \'Playfair Display\', serif; color: #A084C4;">💖 PARTE 4: Cierre y Conexión</h2><p>¿Necesitas ayuda o quieres compartir tu proceso? Estoy aquí para ti. Escríbeme directamente por WhatsApp:</p><p style="text-align:center; font-weight:bold; color:#A084C4;">[QR DE WHATSAPP AQUÍ]</p><p style="text-align:center;">+34 614 32 92 83</p><p style="margin-top: 20px;"><strong>✨ Tu voz es luz para otros ✨</strong><br>Si este viaje está tocando tu corazón, me encantaría que compartieras tu experiencia. Déjanos una reseña en Amazon. Tu testimonio es el faro que ayudará a otras mujeres a encontrar su propio camino de paz. ¡Cuéntales cómo te sientes al activar tus códigos y colorear tus sueños!</p><div style="text-align: center; margin-top: 25px;"><a href="#" style="display: inline-block; background-color: #A084C4; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Dejar mi reseña en Amazon</a></div></div></div>', 'Hola ${name}, bienvenido!')
      ON CONFLICT (id) DO UPDATE SET
        email_template = EXCLUDED.email_template,
        whatsapp_template = EXCLUDED.whatsapp_template;
    `;
    console.log('Tabla de plantillas verificada/creada con éxito.');
  } catch (error) {
    console.error('Error al crear/inicializar la tabla de plantillas:', error);
  }
};

module.exports = { sql, createContactsTable, createTemplatesTable };
