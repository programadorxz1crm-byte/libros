import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/user/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchContent = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await fetch('/api/user/content', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          localStorage.clear();
          navigate('/user/login');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, [navigate]);

  if (!user) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <img src={user.profile_picture_url || 'https://via.placeholder.com/100'} alt="Perfil" style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}}/>
        <h1 style={{ color: '#A084C4' }}>Bienvenida a tu Portal, {user.name}</h1>
      </div>

      {/* Guía del PDF */}
      <div className="card">
        <h2 style={{fontFamily: 'Playfair Display, serif', color: '#A084C4'}}>📑 Guía del PDF "Tu Ritual, Tus Reglas"</h2>
        <p><strong>✨ 1. Encuentra tu Momento:</strong> No busques el "momento perfecto", busca <strong>tu</strong> momento. Puede ser con un café por la mañana o antes de dormir para soltar el día.</p>
        <p><strong>🧘 2. Escucha, Visualiza y Siente:</strong> Antes de tocar el papel, escanea el QR y dale play a tu Meditación. Permite que tu intuición elija el primer color.</p>
        <p><strong>🔢 3. La Melodía de los Números:</strong> Cada mandala viene con un Código Sagrado. Deja que su vibración trabaje en tu subconsciente mientras pintas.</p>
        <p><strong>🌈 4. Sin Juicios, Solo Gozo:</strong> ¿Te saliste de la raya? Está bien. Tu alma no conoce de perfección, solo de expresión. Al terminar, di: "Esto es parte de mi nueva realidad. Gracias".</p>
      </div>

      {/* Contenido Subido por Admin */}
      <div className="card">
        <h2 style={{fontFamily: 'Playfair Display, serif', color: '#A084C4'}}>🎁 Tus Regalos Extra</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {content.map((item, index) => (
            <div key={index} style={{border: '1px solid #eee', padding: '1rem', borderRadius: '8px', textAlign: 'center'}}>
              <h4 style={{ color: '#A084C4' }}>{item.name}</h4>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="button">Descargar o Ver</a>
            </div>
          ))}
        </div>
      </div>

      {/* Meditaciones */}
      <div className="card">
          <h2 style={{fontFamily: 'Playfair Display, serif', color: '#A084C4'}}>🧘‍♀️ Meditaciones que te Acompañarán</h2>
          <p>Aquí tienes dos meditaciones para empezar. La primera para conectar con tu intención y la segunda para cerrar tu ritual.</p>
          <div className="meditation-container" style={{margin: '1.5rem 0', textAlign: 'center'}}>
              <h4 style={{color: '#A084C4'}}>Meditación de Intención</h4>
              <iframe 
                  width="560" 
                  height="315" 
                  src="https://www.youtube.com/embed/g_sf_p3O3B4"
                  title="Meditación Guiada para Empezar el Día" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{borderRadius: '8px', maxWidth: '100%'}}>
              </iframe>
          </div>
          <div className="meditation-container" style={{margin: '1.5rem 0', textAlign: 'center'}}>
              <h4 style={{color: '#A084C4'}}>Meditación de Cierre</h4>
              <iframe 
                  width="560" 
                  height="315" 
                  src="https://www.youtube.com/embed/c5r4_G_r7sI"
                  title="Meditación Guiada para Dormir Profundamente" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{borderRadius: '8px', maxWidth: '100%'}}>
              </iframe>
          </div>
      </div>

      {/* Cierre y Conexión */}
      <div className="card" style={{textAlign: 'center'}}>
        <h2 style={{fontFamily: 'Playfair Display, serif', color: '#A084C4'}}>💖 Cierre y Conexión</h2>
        <p>¿Necesitas ayuda o quieres compartir tu proceso? Escríbeme directamente por WhatsApp:</p>
        <a href="https://wa.me/34614329283" target="_blank" rel="noopener noreferrer" style={{fontWeight: 'bold', color: '#A084C4', textDecoration: 'none', fontSize: '1.1rem'}}>+34 614 32 92 83</a>
        <p style={{marginTop: '2rem'}}><strong>✨ Tu voz es luz para otros ✨</strong><br/>Si este viaje está tocando tu corazón, me encantaría que compartieras tu experiencia.</p>
        <a href="https://www.amazon.es/review/create-review?asin=B0CL5T2294" target="_blank" rel="noopener noreferrer" className="button">Dejar mi reseña en Amazon</a>
      </div>

    </div>
  );
};

export default UserDashboard;
