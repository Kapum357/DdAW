// src/services/api.js
// Servicio centralizado para conexión con el backend
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Cambia el puerto si tu backend usa otro


import { getToken } from './authService';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Interceptor para agregar el token JWT a cada petición
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Ejemplo de uso: api.get('/products'), api.post('/login', {...})
export default api;
