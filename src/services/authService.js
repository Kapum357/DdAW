// Servicio para autenticación y manejo de JWT

const API_URL = 'http://localhost:3000';
import { jwtDecode } from 'jwt-decode';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem('token', data.token);
    try {
      const decoded = jwtDecode(data.token);
      // Usar siempre _id como userId si está presente
      const userId = decoded._id || decoded.id || decoded.userId || decoded.username || null;
      if (userId) {
        localStorage.setItem('userId', userId);
      }
    } catch (e) {}
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}

export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : ''
  };
  return fetch(url, { ...options, headers });
}
