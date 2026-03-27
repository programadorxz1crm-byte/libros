import React, { useState } from 'react';

const FileUpload = ({ token, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    setMessage('Subiendo archivo...');

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream'
          },
          body: file,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`¡Archivo subido con éxito: ${data.url}!`);
        setFile(null); // Limpiar la selección
        if (onUploadComplete) onUploadComplete(); // Notificar que la subida se completó
      } else {
        setMessage(`Error al subir el archivo: ${data.message}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMessage('Hubo un problema de conexión al subir el archivo.');
    }
  };

  return (
    <div className="card">
      <h3>Subir Nuevo Contenido</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Subir Archivo</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
