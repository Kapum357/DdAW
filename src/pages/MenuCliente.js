import React, { useEffect, useState } from 'react';
import PedidoForm from '../components/PedidoForm';
import OrderStatusNotification from '../components/OrderStatusNotification';
import api from '../services/api';

export default function MenuCliente() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      try {
        const res = await api.get('/api/productos');
        setProductos(res.data);
      } catch (err) {
        setError('Error al cargar el menú');
      }
      setLoading(false);
    }
    fetchProductos();
  }, []);

  // Obtener userId del localStorage (ajusta según tu lógica de autenticación)
  const userId = localStorage.getItem('userId');
  return (
    <div className='main'>
      <OrderStatusNotification userId={userId} />
      <h2>Menú para Clientes</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <span>Cargando productos...</span>
      ) : (
        <PedidoForm productos={productos} />
      )}
    </div>
  );
}
