// src/services/api.js
// Servicio centralizado para conexión con el backend
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Cambia el puerto si tu backend usa otro

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

// Ejemplo de uso: api.get('/products'), api.post('/login', {...})
export default api;
