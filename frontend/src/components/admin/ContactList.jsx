import React, { useState, useEffect } from 'react';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/contacts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setContacts(data);
        } else {
          setResponseMessage('Error al cargar los contactos.');
        }
      } catch (err) {
        setResponseMessage('Error de conexión al cargar los contactos.');
      }
    };

    fetchContacts();
  }, [token]);

  const handleSelectContact = (whatsapp) => {
    setSelectedContacts(prev => 
      prev.includes(whatsapp) 
        ? prev.filter(w => w !== whatsapp) 
        : [...prev, whatsapp]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.whatsapp));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage('Enviando mensajes...');

    try {
      const response = await fetch('http://localhost:3001/api/admin/bulk-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ numbers: selectedContacts, message }),
      });

      const data = await response.json();
      if (response.ok) {
        setResponseMessage(`¡Envío completado! Éxitos: ${data.successes}, Fallos: ${data.failures}`);
      } else {
        setResponseMessage(`Error en el envío: ${data.message}`);
      }
    } catch (err) {
      setResponseMessage('Error de conexión al enviar los mensajes.');
    }
  };

  return (
    <div style={{ marginTop: '3rem' }}>
      <h2>Enviar Mensaje Masivo de WhatsApp</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #ccc' }}>
            <input 
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedContacts.length === contacts.length && contacts.length > 0}
            />
            <label style={{ marginLeft: '0.5rem', fontWeight: 'bold' }}>Seleccionar Todos</label>
          </div>
          {contacts.map(contact => (
            <div key={contact.whatsapp} style={{ padding: '0.5rem 0' }}>
              <input 
                type="checkbox" 
                id={contact.whatsapp} 
                checked={selectedContacts.includes(contact.whatsapp)}
                onChange={() => handleSelectContact(contact.whatsapp)}
              />
              <label htmlFor={contact.whatsapp} style={{ marginLeft: '0.5rem' }}>{contact.name} ({contact.whatsapp})</label>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="bulk_message" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mensaje:</label>
          <textarea
            id="bulk_message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            required
          />
        </div>
        <button type="submit" disabled={selectedContacts.length === 0 || !message}>
          Enviar a {selectedContacts.length} contacto(s)
        </button>
      </form>
      {responseMessage && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{responseMessage}</p>}
    </div>
  );
};

export default ContactList;
