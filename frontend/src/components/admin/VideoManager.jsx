import React, { useState, useEffect } from 'react';

const VideoManager = ({ token }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setVideoUrl(data.welcomeVideoUrl || '');
      } catch (error) {
        console.error('Error fetching video URL:', error);
      }
    };
    fetchVideoUrl();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Guardando...');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ welcomeVideoUrl: videoUrl }),
      });
      const data = await response.json();
      setMessage(data.message || 'URL guardada con éxito.');
    } catch (error) {
      console.error('Error saving video URL:', error);
      setMessage('Hubo un error al guardar la URL.');
    }
  };

  return (
    <div className="card">
      <h3>Gestionar Video de Bienvenida</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>URL del Video (YouTube, Vimeo, etc.):</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Pega aquí la URL del video"
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">Guardar URL del Video</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VideoManager;
