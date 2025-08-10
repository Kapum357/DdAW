import React, { useState } from 'react';

export default function ClienteForm({ onSubmit, initialData, loading }) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [telefono, setTelefono] = useState(initialData?.telefono || '');
  const [direccion, setDireccion] = useState(initialData?.direccion || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateFields = () => {
    if (!nombre.trim()) return 'El nombre es obligatorio.';
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'El email no es válido.';
    if (!telefono.trim() || !/^\d{7,15}$/.test(telefono)) return 'El teléfono debe tener entre 7 y 15 dígitos.';
    return '';
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit && onSubmit({ nombre, email, telefono, direccion });
    setSuccess(initialData ? 'Datos actualizados correctamente.' : 'Cliente registrado correctamente.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3>{initialData ? 'Editar Cliente' : 'Registro de Cliente'}</h3>
      {error && <div style={{ color: '#d32f2f', background: '#fdecea', padding: '0.5rem', borderRadius: 4, marginBottom: '0.7rem', fontWeight: 'bold' }}>{error}</div>}
      {success && <div style={{ color: '#388e3c', background: '#eafaf1', padding: '0.5rem', borderRadius: 4, marginBottom: '0.7rem', fontWeight: 'bold' }}>{success}</div>}
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Nombre: <input value={nombre} onChange={e => setNombre(e.target.value)} required style={{ marginLeft: 8 }} /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Email: <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginLeft: 8 }} /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Teléfono: <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required style={{ marginLeft: 8 }} placeholder="Solo números" /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Dirección: <input value={direccion} onChange={e => setDireccion(e.target.value)} style={{ marginLeft: 8 }} /></label>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.2rem', borderRadius: 4, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        {loading ? 'Guardando...' : (initialData ? 'Guardar cambios' : 'Registrar')}
      </button>
    </form>
  );
}
