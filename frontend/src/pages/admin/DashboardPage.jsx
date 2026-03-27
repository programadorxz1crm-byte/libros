import React from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateEditor from '../../components/admin/TemplateEditor';
import ContactList from '../../components/admin/ContactList';
import FileUpload from '../../components/admin/FileUpload';
import EmailSender from '../../components/admin/EmailSender';

const DashboardPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

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
      <p>¡Bienvenido! Desde aquí podrás gestionar el contenido de tu web.</p>
      
      <hr style={{ margin: '2rem 0' }} />
      <FileUpload token={token} />
      <hr style={{ margin: '2rem 0' }} />

      <EmailSender token={token} />

      <hr style={{ margin: '2rem 0' }} />

      <TemplateEditor />
      <ContactList />
    </div>
  );
};

export default DashboardPage;
