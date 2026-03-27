import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem', fontSize: '0.9rem' }}>
      <p>&copy; 2026 Ángeles Sagrados. Todos los derechos reservados.</p>
      <Link to="/admin/login">Admin</Link>
    </footer>
  );
};

export default Footer;
