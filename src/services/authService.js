// Servicio para autenticación y manejo de JWT

const API_URL = 'http://localhost:3000';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok && data.accessToken) {
    localStorage.setItem('token', data.accessToken);
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
