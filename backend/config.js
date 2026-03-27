const bcrypt = require('bcrypt');

// En un entorno de producción, estos valores deberían estar en variables de entorno.
const ADMIN_USERNAME = 'admin';
// Contraseña sin encriptar. La encriptaremos antes de guardarla.
const ADMIN_PASSWORD = 'password123'; 
const JWT_SECRET = 'un_secreto_muy_secreto_y_dificil_de_adivinar';

// Generamos el hash de la contraseña para no guardarla en texto plano
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, saltRounds);

module.exports = {
  ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH: hashedPassword,
  JWT_SECRET,
};
