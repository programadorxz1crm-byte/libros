import React, { useState, useEffect } from 'react';

const TemplateEditor = () => {
  const [templates, setTemplates] = useState({ email: '', whatsapp: '', whatsappApiToken: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/templates', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        } else {
          setMessage('Error al cargar las plantillas.');
        }
      } catch (err) {
        setMessage('Error de conexión al cargar las plantillas.');
      }
    };

    fetchTemplates();
  }, [token]);

  const handleChange = (e) => {
    setTemplates({ ...templates, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/admin/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templates),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Plantillas guardadas correctamente.');
      } else {
        setMessage('Error al guardar las plantillas.');
      }
    } catch (err) {
      setMessage('Error de conexión al guardar las plantillas.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Editar Plantillas</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="email_template" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Plantilla de Correo (HTML permitido):</label>
          <textarea
            id="email_template"
            name="email"
            value={templates.email}
            onChange={handleChange}
            rows="15"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="whatsapp_template" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Plantilla de WhatsApp:</label>
          <textarea
            id="whatsapp_template"
            name="whatsapp"
            value={templates.whatsapp}
            onChange={handleChange}
            rows="5"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="whatsapp_token" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Token de la API de WhatsApp:</label>
          <input
            type="text"
            id="whatsapp_token"
            name="whatsappApiToken"
            value={templates.whatsappApiToken || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Pega tu token de autorización aquí"
          />
        </div>
        <button type="submit">Guardar Plantillas y Token</button>
      </form>
      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

export default TemplateEditor;
