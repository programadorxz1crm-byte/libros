import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error('Error al obtener el contenido');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setContent(data);
        }
      } catch (error) {
        console.error('Error al cargar el contenido:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const audios = content.filter(item => item.type === 'audio');
  const pdfs = content.filter(item => item.type === 'pdf');

  return (
    <div>
      <Header />
      <main>
        <section className="card">
          <h1>Tus Regalos</h1>
          <p>¡Gracias por registrarte! Aquí tienes acceso a tu contenido exclusivo.</p>

          {loading ? (
            <p>Cargando contenido...</p>
          ) : (
            <>
              <hr style={{ margin: '2rem 0' }} />
              <h2>Audios</h2>
              {audios.length > 0 ? (
                <ul>
                  {audios.map(audio => (
                    <li key={audio.name}>
                      <p>{audio.name.split('-').slice(1).join('-')}</p>
                      <audio controls src={audio.url}>Tu navegador no soporta el elemento de audio.</audio>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay audios disponibles en este momento.</p>
              )}

              <hr style={{ margin: '2rem 0' }} />

              <h2>PDFs</h2>
              {pdfs.length > 0 ? (
                <ul>
                  {pdfs.map(pdf => (
                    <li key={pdf.name}>
                      <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                        {pdf.name.split('-').slice(1).join('-')}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay PDFs disponibles en este momento.</p>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
