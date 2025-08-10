import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../services/authService';

function Menu() {
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Modal confirmation logic
  const handleConfirmOrder = () => {
    setShowModal(false);
    enviarPedido();
  };
  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [pedido, setPedido] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [loadingMesas, setLoadingMesas] = useState(false);
  const [loadingPedido, setLoadingPedido] = useState(false);

  useEffect(() => {
    // Fetch order history for the logged-in user
    async function fetchHistorial() {
      setLoadingHistorial(true);
      const token = getToken();
      let usuario = '';
      if (token) {
        try {
          const decoded = jwtDecode(token);
          usuario = decoded.id || decoded._id || decoded.userId || '';
        } catch (e) {
          usuario = '';
        }
      }
      if (usuario) {
        try {
          const res = await api.get(`/api/pedidos?usuario=${usuario}`);
          setHistorial(res.data);
        } catch (err) {
          // Ignore error for history
        }
      }
      setLoadingHistorial(false);
    }
    fetchHistorial();
    async function fetchProductos() {
      setLoadingProductos(true);
      try {
        const res = await api.get('/api/productos');
        setProductos(res.data);
      } catch (err) {
        setMensaje('Error al cargar el menú');
      }
      setLoadingProductos(false);
    }
    async function fetchMesas() {
      setLoadingMesas(true);
      try {
        const res = await api.get('/api/mesas');
        setMesas(res.data);
      } catch (err) {
        setMensaje('Error al cargar las mesas');
      }
      setLoadingMesas(false);
    }
    fetchProductos();
    fetchMesas();

    // ...existing code...
  }, []);

  const agregarProducto = (producto, cantidad = 1) => {
    setPedido(prev => {
      const existe = prev.find(p => p.producto._id === producto._id);
      if (existe) {
        return prev.map(p =>
          p.producto._id === producto._id
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      }
      return [...prev, { producto, cantidad }];
    });
    // Reset input value to 1 after adding
    const input = document.getElementById(`cantidad-${producto._id}`);
    if (input) input.value = 1;
    // Show feedback
    setMensaje(`Agregado: ${producto.nombre} x${cantidad}`);
    setHighlightedId(producto._id);
    setTimeout(() => {
      setMensaje('');
      setHighlightedId(null);
    }, 1200);
  };

  const quitarProducto = (id) => {
    setPedido(prev =>
      prev
        .map(p => p.producto._id === id ? { ...p, cantidad: p.cantidad - 1 } : p)
        .filter(p => p.cantidad > 0)
    );
  };

  const cambiarCantidad = (id, cantidad) => {
    setPedido(prev =>
      prev.map(p =>
        p.producto._id === id ? { ...p, cantidad: cantidad } : p
      )
    );
  };
  const enviarPedido = async () => {
    setLoadingPedido(true);
    try {
      if (!mesaSeleccionada) {
        setMensaje('Seleccione una mesa');
        setLoadingPedido(false);
        return;
      }
      // Obtener el id de usuario desde el token JWT
      const token = getToken();
      let usuario = '';
      if (token) {
        try {
          const decoded = jwtDecode(token);
          usuario = decoded.id || decoded._id || decoded.userId || '';
        } catch (e) {
          usuario = '';
        }
      }
      if (!usuario) {
        setMensaje('No se pudo obtener el usuario. Inicie sesión nuevamente.');
        setLoadingPedido(false);
        return;
      }
      const productosPedido = pedido.map(p => ({
        producto: p.producto._id,
        cantidad: p.cantidad
      }));
      await api.post('/pedidos', {
        productos: productosPedido,
        mesa: mesaSeleccionada,
        usuario
      });
      setMensaje('Pedido enviado correctamente');
      setPedido([]);
      setMesaSeleccionada('');
      setTimeout(() => setMensaje(''), 2500);
    } catch (err) {
      setMensaje('Error al enviar el pedido');
      setTimeout(() => setMensaje(''), 2500);
    }
    setLoadingPedido(false);
  };

  // Calcular el total del pedido
  const total = pedido.reduce((acc, p) => acc + p.producto.precio * p.cantidad, 0);

  return (
    <div className='main' style={{
      maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1rem',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Menú</h2>
      {mensaje && (
        <div
          style={{
            background: mensaje.toLowerCase().includes('error') ? '#f8d7da' : '#e2f7e2',
            color: mensaje.toLowerCase().includes('error') ? '#721c24' : '#155724',
            border: mensaje.toLowerCase().includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1rem'
          }}
        >
          {mensaje}
        </div>
      )}
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="mesa-select" style={{ fontWeight: 'bold' }}>Seleccione mesa: </label>
        {loadingMesas ? (
          <span>Cargando mesas...</span>
        ) : mesas.length === 0 ? (
          <span style={{ color: '#888', fontStyle: 'italic', marginLeft: '1rem' }}>No hay mesas disponibles.</span>
        ) : (
          <select
            id="mesa-select"
            value={mesaSeleccionada}
            onChange={e => setMesaSeleccionada(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', maxWidth: '200px' }}
            aria-label="Seleccionar mesa"
          >
            <option value="">--Seleccione--</option>
            {mesas.map(mesa => (
              <option
                key={mesa._id}
                value={mesa._id}
                disabled={mesa.estado && mesa.estado !== 'libre'}
                style={{ color: mesa.estado === 'libre' ? '#222' : '#aaa' }}
                aria-label={`Mesa ${mesa.numero || mesa.nombre || mesa._id} (${mesa.estado || 'desconocido'})`}
              >
                Mesa {mesa.numero || mesa.nombre || mesa._id} ({mesa.estado || 'desconocido'})
              </option>
            ))}
          </select>
        )}
      </div>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Productos</h3>
      {loadingProductos ? (
        <span>Cargando productos...</span>
      ) : productos.length === 0 ? (
        <span style={{ color: '#888', fontStyle: 'italic' }}>No hay productos disponibles.</span>
      ) : (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {productos.map(prod => (
            <li key={prod._id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {prod.imagen || prod.image ? (
                <img
                  src={prod.imagen || prod.image}
                  alt={prod.nombre}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', marginRight: '0.7rem', background: '#eee', border: '1px solid #ddd' }}
                />
              ) : (
                <div style={{ width: '48px', height: '48px', marginRight: '0.7rem', borderRadius: '6px', background: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '1.5rem', border: '1px solid #ddd' }}>
                  <span role="img" aria-label="Sin imagen">🍽️</span>
                </div>
              )}
              <span style={{ minWidth: '120px', fontWeight: '500' }}>{prod.nombre}</span>
              <span style={{ marginLeft: '0.5rem', color: '#555' }}>${prod.precio}</span>
              <input
                type="number"
                min="1"
                style={{ width: '50px', marginLeft: '1rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                defaultValue={1}
                id={`cantidad-${prod._id}`}
                aria-label={`Cantidad para ${prod.nombre}`}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const cantidad = parseInt(e.target.value, 10) || 1;
                    agregarProducto(prod, cantidad);
                  }
                }}
              />
              <button
                style={{ marginLeft: '0.5rem', padding: '0.3rem 0.7rem', fontSize: '1rem', borderRadius: '4px', border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}
                onClick={() => {
                  const cantidad = parseInt(document.getElementById(`cantidad-${prod._id}`).value, 10) || 1;
                  agregarProducto(prod, cantidad);
                }}
                aria-label={`Agregar ${prod.nombre} al pedido`}
              >Agregar</button>
            </li>
          ))}
        </ul>
      )}
      <h3 style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>Resumen del pedido</h3>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {pedido.map(p => (
          <li
            key={p.producto._id}
            style={{
              background: highlightedId === p.producto._id ? '#ffeeba' : 'transparent',
              transition: 'background 0.3s',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              marginBottom: '0.2rem',
              display: 'flex', alignItems: 'center', flexWrap: 'wrap'
            }}
            tabIndex={0}
            aria-label={`Producto en pedido: ${p.producto.nombre}, cantidad ${p.cantidad}`}
          >
            <span style={{ minWidth: '120px' }}>{p.producto.nombre}</span> x
            <input
              type="number"
              min="1"
              value={p.cantidad}
              style={{ width: '40px', margin: '0 0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
              onChange={e => cambiarCantidad(p.producto._id, parseInt(e.target.value, 10) || 1)}
              aria-label={`Cantidad para ${p.producto.nombre}`}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  quitarProducto(p.producto._id);
                }
              }}
            />
            <button onClick={() => quitarProducto(p.producto._id)} style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '1rem', borderRadius: '4px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }} aria-label={`Quitar ${p.producto.nombre} del pedido`}>
              Quitar
            </button>
          </li>
        ))}
      </ul>
      {pedido.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Total:</strong> ${total.toFixed(2)}</p>
          <button onClick={handleOpenModal} disabled={loadingPedido} style={{ padding: '0.6rem 1.2rem', fontSize: '1.1rem', borderRadius: '4px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', marginTop: '0.5rem' }}>
            {loadingPedido ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      )}
      {/* Order Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', minWidth: '320px', maxWidth: '90vw', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '1.3rem' }}>Confirmar pedido</h3>
            <p><strong>Mesa:</strong> {mesas.find(m => m._id === mesaSeleccionada)?.numero || mesaSeleccionada}</p>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {pedido.map(p => (
                <li key={p.producto._id} style={{ marginBottom: '0.3rem' }}>
                  {p.producto.nombre} x {p.cantidad} (${(p.producto.precio * p.cantidad).toFixed(2)})
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Total:</strong> ${total.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button onClick={handleConfirmOrder} disabled={loadingPedido} style={{ background: '#28a745', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}>
                Confirmar y enviar
              </button>
              <button onClick={handleCloseModal} style={{ background: '#ccc', color: '#222', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order History Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Historial de pedidos</h3>
        {loadingHistorial ? (
          <span>Cargando historial...</span>
        ) : historial.length === 0 ? (
          <span style={{ color: '#888', fontStyle: 'italic' }}>No hay pedidos previos.</span>
        ) : (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {historial.map(ped => (
              <li key={ped._id} style={{ marginBottom: '0.7rem', background: '#f4f4f4', borderRadius: '4px', padding: '0.7rem' }}>
                <div><strong>Mesa:</strong> {ped.mesa?.numero || ped.mesa || '-'}</div>
                <div><strong>Fecha:</strong> {new Date(ped.fecha).toLocaleString()}</div>
                <div><strong>Estado:</strong> {ped.estado}</div>
                <div><strong>Productos:</strong>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {ped.productos.map((prod, idx) => (
                      <li key={idx}>{prod.producto?.nombre || prod.producto} x {prod.cantidad}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Menu;