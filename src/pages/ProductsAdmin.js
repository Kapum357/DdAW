import React, { useEffect, useState } from 'react';
import ProductsList from '../components/ProductsList';
import ProductForm from '../components/ProductForm';
import api from '../services/api';

export default function ProductsAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/productos');
      setProductos(res.data);
    } catch (err) {
      setError('Error al cargar los productos');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await api.post('/api/productos', data);
      setFormVisible(false);
      setEditData(null);
      fetchProductos();
    } catch (err) {
      setError('Error al crear el producto');
    }
    setFormLoading(false);
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    try {
      await api.put(`/api/productos/${editData._id}`, data);
      setFormVisible(false);
      setEditData(null);
      fetchProductos();
    } catch (err) {
      setError('Error al editar el producto');
    }
    setFormLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    setLoading(true);
    try {
      await api.delete(`/api/productos/${id}`);
      fetchProductos();
    } catch (err) {
      setError('Error al eliminar el producto');
    }
    setLoading(false);
  };

  // Función para crear producto rápido desde el botón Agregar
  const handleAdd = async (prod) => {
    setLoading(true);
    setError('');
    try {
      // Se espera que prod tenga nombre, descripcion, precio, tipo, imagen
      await api.post('/api/productos', prod);
      fetchProductos();
    } catch (err) {
      setError('Error al agregar el producto');
    }
    setLoading(false);
  };

  return (
    <div className='main'>
      <h2>Gestión de Productos</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {formVisible && (
        <ProductForm
          onSubmit={editData ? handleEdit : handleCreate}
          initialData={editData}
          loading={formLoading}
        />
      )}
      <button onClick={() => { setFormVisible(true); setEditData(null); }} style={{ marginBottom: '1rem', padding: '0.5rem 1.2rem', borderRadius: 4, background: '#28a745', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
        Nuevo Producto
      </button>
      {loading ? (
        <span>Cargando productos...</span>
      ) : (
        <ProductsList
          productos={productos}
          admin
          onEdit={prod => { setFormVisible(true); setEditData(prod); }}
          onDelete={prod => handleDelete(prod._id)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
