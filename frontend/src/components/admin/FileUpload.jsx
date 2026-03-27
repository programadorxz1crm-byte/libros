import React, { useState } from 'react';

const FileUpload = ({ token }) => {
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`¡Archivo subido con éxito: ${data.file.filename}!`);
      } else {
        setMessage(`Error al subir el archivo: ${data.message}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMessage('Hubo un problema de conexión al subir el archivo.');
    }
  };

  return (
    <div>
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
