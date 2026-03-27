import React, { useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const response = await fetch('/api/content');
        const data = await response.json();
        const latestVideo = data.find(item => item.type === 'video');
        if (latestVideo) {
          setVideoUrl(latestVideo.url);
        }
      } catch (error) {
        console.error('Error al cargar el video:', error);
      }
    };

    fetchLatestVideo();
  }, []);

  if (!videoUrl) {
    return null; // No mostrar nada si no hay video
  }

  return (
    <div className="video-container">
      <video controls width="100%">
        <source src={videoUrl} type="video/mp4" />
        Tu navegador no soporta la etiqueta de video.
      </video>
      <div className="progress-bar-container">
        <div className="progress-bar-animated"></div>
      </div>
    </div>
  );
};

export default VideoPlayer;
