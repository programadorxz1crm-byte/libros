import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLoginPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Verificando...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userToken', data.auth_token);
        localStorage.setItem('userData', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Error al verificar el correo.');
      }
    } catch (error) {
      setMessage('Hubo un problema de conexión.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '10rem auto', padding: '2rem' }} className="card">
      <h2 style={{ textAlign: 'center', color: '#A084C4' }}>Acceso a tus Regalos</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Introduce el correo con el que te registraste para acceder a tu portal.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          required
          style={{ width: '100%', padding: '10px', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ width: '100%', padding: '12px' }}>Acceder</button>
      </form>
      {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: '#e74c3c' }}>{message}</p>}
    </div>
  );
};

export default UserLoginPage;
