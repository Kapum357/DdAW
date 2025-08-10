import React, { useState } from 'react';

export default function ProductForm({ onSubmit, initialData, loading }) {
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
  const [precio, setPrecio] = useState(initialData?.precio || '');
  const [tipo, setTipo] = useState(initialData?.tipo || 'plato');
  const [imagen, setImagen] = useState(initialData?.imagen || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateFields = () => {
    if (!nombre.trim()) return 'El nombre es obligatorio.';
    if (!precio || isNaN(precio) || Number(precio) <= 0) return 'El precio debe ser mayor a 0.';
    if (!tipo) return 'La categoría es obligatoria.';
    if (imagen && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(imagen.trim())) return 'La URL de la imagen debe ser válida y terminar en jpg, jpeg, png, webp o gif.';
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
    onSubmit({ nombre, descripcion, precio: Number(precio), tipo, imagen });
    setSuccess(initialData ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</h3>
      {error && <div style={{ color: '#d32f2f', background: '#fdecea', padding: '0.5rem', borderRadius: 4, marginBottom: '0.7rem', fontWeight: 'bold' }}>{error}</div>}
      {success && <div style={{ color: '#388e3c', background: '#eafaf1', padding: '0.5rem', borderRadius: 4, marginBottom: '0.7rem', fontWeight: 'bold' }}>{success}</div>}
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Nombre: <input value={nombre} onChange={e => setNombre(e.target.value)} required style={{ marginLeft: 8 }} /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Descripción: <input value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{ marginLeft: 8 }} /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Precio: <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required min={0} step={0.01} style={{ marginLeft: 8 }} /></label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Categoría: 
          <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="plato">Plato</option>
            <option value="bebida">Bebida</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '0.7rem' }}>
        <label>Imagen (URL): <input value={imagen} onChange={e => setImagen(e.target.value)} style={{ marginLeft: 8 }} /></label>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.2rem', borderRadius: 4, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        {loading ? 'Guardando...' : (initialData ? 'Guardar cambios' : 'Crear producto')}
      </button>
    </form>
  );
}
