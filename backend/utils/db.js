const { sql } = require('@vercel/postgres');

const createContactsTable = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        whatsapp VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Tabla de contactos verificada/creada con éxito.');
  } catch (error) {
    console.error('Error al crear la tabla de contactos:', error);
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
      VALUES (1, '<h1>Bienvenido, ${name}!</h1><p>Este es el correo por defecto.</p>', 'Hola ${name}, bienvenido!')
      ON CONFLICT (id) DO NOTHING;
    `;
    console.log('Tabla de plantillas verificada/creada con éxito.');
  } catch (error) {
    console.error('Error al crear/inicializar la tabla de plantillas:', error);
  }
};

module.exports = { sql, createContactsTable, createTemplatesTable };
