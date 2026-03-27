import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
  const [content, setContent] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '5rem auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', color: '#A084C4' }}>Tus Regalos Especiales</h1>
      <p style={{ textAlign: 'center', marginBottom: '3rem' }}>Aquí tienes el contenido exclusivo que hemos preparado para ti. ¡Disfrútalo!</p>
      
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
