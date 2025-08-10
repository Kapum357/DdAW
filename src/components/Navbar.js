import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, isAuthenticated } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav style={{ background: '#222', padding: '1rem' }}>
      <h2 style={{ color: '#fff', margin: 0 }}>Restaurante</h2>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/">Inicio</Link></li>
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/menu">Menú</Link></li>
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/menu-cliente">Menú Cliente</Link></li>
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/pedidos">Pedidos</Link></li>
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/mesas">Mesas</Link></li>
        {!isAuthenticated() && (
          <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/registro-cliente">Registro Cliente</Link></li>
        )}
        <li><Link style={{ color: '#fff', textDecoration: 'none' }} to="/admin">Admin</Link></li>
        {isAuthenticated() && (
          <li>
            <button onClick={handleLogout} style={{ color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
