import React, { useState, useEffect } from 'react';

const EmailSender = ({ token }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/admin/contacts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        // Extraer solo los correos electrónicos de los contactos
        const emails = data.map(contact => contact.email).filter(Boolean);
        setContacts(emails);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }, [token]);

  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmails(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Enviando correo...');

    let recipients = [...selectedEmails];
    if (newEmail) {
      recipients.push(newEmail);
    }

    if (recipients.length === 0) {
      setMessage('Por favor, selecciona al menos un destinatario o escribe un correo nuevo.');
      return;
    }

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ to: recipients, subject, body }),
      });

      const data = await response.json();
      setMessage(data.message || 'El correo ha sido enviado.');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      setMessage('Hubo un error al enviar el correo.');
    }
  };

  return (
    <div className="card">
      <h3>Enviar Correo a Usuarios</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Seleccionar correos registrados:</label>
          <select multiple onChange={handleSelectChange} style={{ width: '100%', height: '150px' }}>
            {contacts.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <small>Puedes seleccionar varios correos manteniendo pulsada la tecla Ctrl (o Cmd en Mac).</small>
        </div>
        <div>
          <label>O enviar a un correo nuevo:</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
          />
        </div>
        <div>
          <label>Asunto:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Cuerpo del Mensaje (HTML permitido):</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="10"
            required
            style={{ width: '100%' }}
          ></textarea>
        </div>
        <button type="submit">Enviar Correo</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default EmailSender;
