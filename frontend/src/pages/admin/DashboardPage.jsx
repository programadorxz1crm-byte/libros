import React from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateEditor from '../../components/admin/TemplateEditor';
import ContactList from '../../components/admin/ContactList';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '5rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Panel de Administrador</h1>
        <button onClick={handleLogout} style={{ height: 'fit-content' }}>Cerrar Sesión</button>
      </div>
      <p>¡Bienvenido! Desde aquí podrás gestionar las plantillas y enviar mensajes masivos.</p>
      <TemplateEditor />
      <ContactList />
    </div>
  );
};

export default DashboardPage;
