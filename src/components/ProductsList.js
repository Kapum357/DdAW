
import React from 'react';

export default function ProductsList({ productos, admin, onEdit, onDelete, onAdd }) {
  if (!productos || productos.length === 0) {
    return <div style={{ color: '#888', fontStyle: 'italic' }}>No hay productos disponibles.</div>;
  }
  return (
    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
      {productos.map(prod => (
        <li key={prod._id || prod.id || prod.nombre} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1rem' }}>
          {prod.imagen ? (
            <img
              src={prod.imagen}
              alt={prod.nombre}
              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem', background: '#eee', border: '1px solid #ddd' }}
            />
          ) : (
            <div style={{ width: '64px', height: '64px', marginRight: '1rem', borderRadius: '8px', background: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '2rem', border: '1px solid #ddd' }}>
              <span role="img" aria-label="Sin imagen">🍽️</span>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{prod.nombre}</div>
            <div style={{ color: '#555', marginBottom: '0.3rem' }}><strong>Categoría:</strong> {prod.tipo}</div>
            <div style={{ color: '#666', marginBottom: '0.3rem' }}><strong>Descripción:</strong> {prod.descripcion || 'Sin descripción'}</div>
            <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Precio:</strong> ${prod.precio}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {admin && (
              <>
                <button onClick={() => onEdit(prod)} style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#ffc107', color: '#222', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Editar</button>
              </>
            )}
            {admin && !prod._id && (
              <button onClick={() => onAdd && onAdd(prod)} style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#28a745', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Agregar</button>
            )}
            <button onClick={() => onDelete(prod)} style={{ padding: '0.3rem 0.8rem', borderRadius: 4, background: '#dc3545', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Eliminar</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
