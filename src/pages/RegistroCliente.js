import React, { useState } from 'react';
import ClienteForm from '../components/ClienteForm';
import api from '../services/api';

export default function RegistroCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/clientes', data);
      setSuccess('Cliente registrado correctamente.');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar cliente');
    }
    setLoading(false);
  };

  return (
    <div className="main">
      <h2>Registro de Cliente</h2>
      <ClienteForm onSubmit={handleSubmit} loading={loading} />
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '1rem' }}>{success}</div>}
    </div>
  );
}
