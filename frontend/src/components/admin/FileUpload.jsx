import React, { useState } from 'react';

const FileUpload = ({ token }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessage('Por favor, selecciona uno o más archivos.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

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
        setMessage(`¡${data.files.length} archivos subidos con éxito!`);
        setFiles([]); // Limpiar la selección después de subir
      } else {
        setMessage(`Error al subir los archivos: ${data.message}`);
      }
    } catch (error) {
      console.error('Error de red:', error);
      setMessage('Hubo un problema de conexión al subir los archivos.');
    }
  };

  return (
    <div className="card">
      <h3>Subir Nuevo Contenido</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        
        {files.length > 0 && (
          <div>
            <h4>Archivos seleccionados:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit">Subir Archivos</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
