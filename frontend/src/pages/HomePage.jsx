import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import RegistrationForm from '../components/RegistrationForm';
import VideoPlayer from '../components/VideoPlayer';

const HomePage = () => {
  return (
    <div>
      <Header />
      <main>
        <section id="welcome" className="card">
          <h2>🎁 PORTAL DE BIENVENIDA: ÁNGELES SAGRADOS</h2>
          <VideoPlayer />
        </section>

        <section id="gifts" className="card">
          <h2>🎁 Tus Regalos Extra</h2>
          <p>Para obtener tus regalos, por favor, déjanos tus datos:</p>
          <RegistrationForm />
        </section>

        <section id="guide" className="card">
          <h2>📑 Guía del PDF "Tu Ritual, Tus Reglas"</h2>
          {/* Aquí irá la guía */}
        </section>

        <section id="contact" className="card">
          <h2>💖 Cierre y Conexión</h2>
          {/* Aquí irá la información de contacto y el botón de reseña */}
        </section>
      </main>
      <footer style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem', fontSize: '0.9rem' }}>
        <p>&copy; 2024 Ángeles Sagrados. Todos los derechos reservados.</p>
        <Link to="/admin/login">Admin</Link>
      </footer>
    </div>
  );
};

export default HomePage;
