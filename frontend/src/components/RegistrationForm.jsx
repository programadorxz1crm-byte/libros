import React, { useState } from 'react';
import Modal from './Modal'; // Importar el nuevo componente

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setModalContent({
          title: '¡Registro completado!',
          body: 'Hemos enviado un enlace a tu correo para que puedas acceder a tus regalos. ¡Revisa tu bandeja de entrada (y la de spam)!'
        });
        setIsModalOpen(true);
        setFormData({ name: '', email: '', whatsapp: '' }); // Limpiar el formulario
      } else {
        setModalContent({
          title: 'Error en el registro',
          body: 'Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo más tarde.'
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setModalContent({
        title: 'Error de conexión',
        body: 'No pudimos comunicarnos con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.'
      });
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="whatsapp">WhatsApp:</label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Obtener Regalo</button>
      </form>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{modalContent.title}</h2>
        <p>{modalContent.body}</p>
      </Modal>
    </>
  );
};

export default RegistrationForm;
