import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import RegistrationForm from '../components/RegistrationForm';
import VideoPlayer from '../components/VideoPlayer';
import Footer from '../components/Footer';

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
      <Footer />
    </div>
  );
};

export default HomePage;
