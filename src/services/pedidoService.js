// src/services/pedidoService.js
import api from './api';

/**
 * Envía un pedido al backend de forma asíncrona.
 * @param {Object} pedido - Objeto con los datos del pedido.
 * @param {Array} pedido.productos - Array de productos [{ producto: id, cantidad }].
 * @param {string} pedido.mesa - ID de la mesa.
 * @param {string} pedido.usuario - ID del usuario (opcional, si el backend lo toma del token puede omitirse).
 * @returns {Promise<Object>} Respuesta del backend.
 */
export async function enviarPedido(pedido) {
  try {
    const response = await api.post('/api/pedidos', pedido);
    return response.data;
  } catch (error) {
    // Puedes personalizar el manejo de errores según tu UI
    throw error.response?.data || { error: 'Error al enviar el pedido' };
  }
}

/**
 * Obtiene pedidos con filtros opcionales por usuario, estado o nombre de usuario.
 * @param {Object} filtros - Filtros de búsqueda (usuario, estado, nombreUsuario).
 * @returns {Promise<Array>} Lista de pedidos.
 */
export async function obtenerPedidos(filtros = {}) {
  try {
    const params = {};
    if (filtros.usuario) params.usuario = filtros.usuario;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.nombreUsuario) params.nombreUsuario = filtros.nombreUsuario;
    const response = await api.get('/api/pedidos', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener pedidos' };
  }
}
