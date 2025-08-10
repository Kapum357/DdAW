import React, { useEffect, useState } from 'react';
import { obtenerPedidos } from '../services/pedidoService';

const estados = [
  '', // Todos
  'En preparación',
  'Listo',
  'Servido'
];

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estado, setEstado] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar pedidos con filtros
  const cargarPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const filtros = {};
      if (estado) filtros.estado = estado;
      if (usuario) filtros.usuario = usuario;
      if (nombreUsuario) filtros.nombreUsuario = nombreUsuario;
      const data = await obtenerPedidos(filtros);
      setPedidos(data);
    } catch (err) {
      setError(err.error || 'Error al cargar pedidos');
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPedidos();
    // eslint-disable-next-line
  }, [estado, usuario, nombreUsuario]);

  return (
    <div className='main'>
      <h2>Pedidos</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <label>
          Estado:
          <select value={estado} onChange={e => setEstado(e.target.value)} style={{ marginLeft: 8 }}>
            <option value=''>Todos</option>
            {estados.filter(e => e).map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        <label>
          Cliente (ID):
          <input
            type='text'
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            placeholder='ID de usuario'
            style={{ marginLeft: 8 }}
          />
        </label>
        <label>
          Cliente (nombre):
          <input
            type='text'
            value={nombreUsuario}
            onChange={e => setNombreUsuario(e.target.value)}
            placeholder='Nombre de usuario'
            style={{ marginLeft: 8 }}
          />
        </label>
        <button onClick={cargarPedidos} disabled={loading}>Buscar</button>
      </div>
      {loading && <p>Cargando pedidos...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th>ID</th>
            <th>Cliente</th>
            <th>Mesa</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Productos</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 && !loading && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No hay pedidos</td></tr>
          )}
          {pedidos.map(p => (
            <tr key={p._id}>
              <td>{p._id}</td>
              <td>{p.usuario?.nombre || p.usuario?._id || '-'}</td>
              <td>{p.mesa?.numero || p.mesa?._id || '-'}</td>
              <td>{p.estado}</td>
              <td>{new Date(p.fecha).toLocaleString()}</td>
              <td>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {p.productos.map((item, idx) => (
                    <li key={idx}>{item.producto?.nombre || item.producto?._id} x{item.cantidad}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pedidos;
