import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.welcomeVideoUrl) {
          // Convertir URL de YouTube a formato de inserción (embed)
          const url = new URL(data.welcomeVideoUrl);
          if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
            setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
          } else {
            setVideoUrl(data.welcomeVideoUrl);
          }
        }
      } catch (error) {
        console.error('Error al cargar la URL del video:', error);
      }
    };

    fetchVideoUrl();
  }, []);

  if (!videoUrl) {
    return <p style={{ textAlign: 'center', padding: '2rem 0' }}>No hay video de bienvenida disponible en este momento.</p>;
  }

  return (
    <div className="video-container">
      <iframe 
        width="100%" 
        src={videoUrl} 
        title="Video de Bienvenida"
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
        style={{ aspectRatio: '16/9' }}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
