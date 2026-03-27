import React, { useState, useEffect } from 'react';

const FileManager = ({ token, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token, refreshTrigger]);

  const handleDelete = async (fileUrl) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar este archivo? Esta acción no se puede deshacer.')) {
      return;
    }
    setMessage('Borrando archivo...');
    try {
      await fetch('/api/files', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ urls: [fileUrl] }),
      });
      setMessage('Archivo borrado con éxito.');
      fetchFiles(); // Recargar la lista de archivos
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Hubo un error al borrar el archivo.');
    }
  };

  return (
    <div className="card">
      <h3>Gestionar Contenido Subido</h3>
      {message && <p>{message}</p>}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Nombre del Archivo</th>
              <th>Enlace</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.url}>
                <td>{file.pathname.replace(/^\//, '')}</td>
                <td><a href={file.url} target="_blank" rel="noopener noreferrer">Abrir</a></td>
                <td>
                  <button onClick={() => handleDelete(file.url)} style={{backgroundColor: '#e74c3c'}}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileManager;
