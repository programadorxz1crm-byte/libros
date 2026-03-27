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

module.exports = { sql, createContactsTable };
