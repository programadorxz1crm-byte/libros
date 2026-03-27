import React from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateEditor from '../../components/admin/TemplateEditor';
import ContactList from '../../components/admin/ContactList';
import FileUpload from '../../components/admin/FileUpload';
import EmailSender from '../../components/admin/EmailSender';
import FileManager from '../../components/admin/FileManager';

const DashboardPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1); // Cambiar el estado para forzar la recarga de FileManager
  };

  return (
    <div style={{ maxWidth: '800px', margin: '5rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Panel de Administrador</h1>
        <button onClick={handleLogout} style={{ height: 'fit-content' }}>Cerrar Sesión</button>
      </div>
      
      <FileUpload token={token} onUploadComplete={handleUploadComplete} />
      <FileManager token={token} refreshTrigger={refreshTrigger} />
      <EmailSender token={token} />
      
      <div className="card">
        <TemplateEditor />
      </div>
      
      <div className="card">
        <ContactList />
      </div>

    </div>
  );
};

export default DashboardPage;
