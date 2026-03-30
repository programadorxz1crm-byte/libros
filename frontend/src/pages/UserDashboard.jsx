import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/user/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchContent = async () => {
      const token = localStorage.getItem('userToken');
      try {
        const response = await fetch('/api/content', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          // Si el token es inválido, redirigir al login
          localStorage.clear();
          navigate('/user/login');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    // Solo cargar contenido si el perfil está completo
    if (parsedUser && parsedUser.name && parsedUser.whatsapp) {
        fetchContent();
    }
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('Actualizando perfil...');
    const token = localStorage.getItem('userToken');
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: user.name, whatsapp: user.whatsapp }),
      });
      // Actualizar datos locales
      localStorage.setItem('userData', JSON.stringify(user));
      setMessage('¡Perfil actualizado! Ya puedes ver tus regalos.');
      window.location.reload(); // Recargar para mostrar el contenido
    } catch (error) {
      setMessage('Error al actualizar el perfil.');
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessage('Subiendo foto...');
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`/api/user/profile-picture?filename=${file.name}&token=${token}`, {
        method: 'POST',
        body: file,
      });
      const data = await response.json();
      const updatedUser = { ...user, profile_picture_url: data.url };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setMessage('Foto de perfil actualizada.');
    } catch (error) {
      setMessage('Error al subir la foto.');
    }
  };

  if (!user) {
    return null; // O un spinner de carga
  }

  // Si el perfil no está completo, mostrar el formulario de bienvenida
  if (!user.name || !user.whatsapp) {
    return (
      <div style={{ maxWidth: '600px', margin: '5rem auto', padding: '2rem' }} className="card">
        <h1 style={{ textAlign: 'center', color: '#A084C4' }}>¡Casi listo, ${user.email}!</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Completa tu perfil para desbloquear tus regalos.</p>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Nombre:</label>
            <input
              type="text"
              value={user.name || ''}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>WhatsApp:</label>
            <input
              type="text"
              value={user.whatsapp || ''}
              onChange={(e) => setUser({ ...user, whatsapp: e.target.value })}
              required
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit">Guardar y Ver mis Regalos</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    );
  }

  // Si el perfil está completo, mostrar el dashboard de regalos
  return (
    <div style={{ maxWidth: '900px', margin: '5rem auto', padding: '2rem' }}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '3rem', gap: '2rem'}}>
            <img src={user.profile_picture_url || 'https://via.placeholder.com/100'} alt="Perfil" style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}}/>
            <div>
                <h2>Bienvenida, {user.name}</h2>
                <p>Aquí tienes el contenido exclusivo que hemos preparado para ti. ¡Disfrútalo!</p>
                <label htmlFor="picture-upload" style={{cursor: 'pointer', color: '#A084C4', textDecoration: 'underline'}}>
                    Cambiar foto de perfil
                </label>
                <input id="picture-upload" type="file" accept="image/*" onChange={handlePictureUpload} style={{display: 'none'}}/>
            </div>
        </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {content.map((item, index) => (
          <div key={index} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#A084C4' }}>{item.name}</h3>
            <p>Tipo: {item.type}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ 
              display: 'inline-block', 
              marginTop: '1rem', 
              padding: '10px 15px', 
              backgroundColor: '#A084C4', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px' 
            }}>Descargar o Ver</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
