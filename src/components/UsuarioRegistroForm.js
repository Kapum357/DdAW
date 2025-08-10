import React, { useState } from 'react';

export default function UsuarioRegistroForm({ onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('mesero');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol })
      });
      if (res.ok) {
        setSuccess(true);
        setNombre('');
        setEmail('');
        setPassword('');
        setRol('mesero');
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de red');
    }
  };

  return (
    <div className="usuario-registro-form">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select value={rol} onChange={e => setRol(e.target.value)} required>
          <option value="administrador">Administrador</option>
          <option value="mesero">Mesero</option>
          <option value="cocina">Cocina</option>
        </select>
        <button type="submit">Registrarse</button>
      </form>
      {success && <p style={{color:'green'}}>Usuario registrado correctamente.</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
