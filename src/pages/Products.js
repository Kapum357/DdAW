
import React, { useEffect, useState } from 'react';
import ProductsList from '../components/ProductsList';
import api from '../services/api';


function Products() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      try {
        const res = await api.get('/api/productos');
        setProductos(res.data);
      } catch (err) {
        setError('Error al cargar los productos');
      }
      setLoading(false);
    }
    fetchProductos();
  }, []);

  // Agregar producto al carrito local
  const handleAdd = (prod) => {
    setCarrito(prev => {
      const existe = prev.find(p => p._id === prod._id);
      if (existe) {
        return prev.map(p => p._id === prod._id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });
    setMensaje(`Agregado: ${prod.nombre}`);
    setTimeout(() => setMensaje(''), 1200);
  };

  // Calcular subtotal y total
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const total = subtotal; // Solo suma de productos

  return (
    <div className='main'>
      <h2>Productos</h2>
      {mensaje && <div style={{ color: 'green', marginBottom: '1rem' }}>{mensaje}</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <span>Cargando productos...</span>
      ) : (
        <ProductsList productos={productos} onAdd={handleAdd} />
      )}
      {carrito.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Carrito</h3>
          <ul>
            {carrito.map(item => (
              <li key={item._id}>{item.nombre} x {item.cantidad}</li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Subtotal: ${subtotal.toFixed(2)}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#007bff' }}>
            Total: ${total.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
