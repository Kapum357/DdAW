import React, { useState, useEffect } from 'react';
import './PedidoForm.css';
import api from '../services/api';

const CART_KEY = 'pedido_cart';

export default function PedidoForm({ productos }) {
  // Cart state and features
  const [pedido, setPedido] = useState([]);
  // Thresholds
  const MIN_ORDER = 20; // Minimum order amount for checkout
  const FREE_DELIVERY = 50; // Free delivery threshold
  const [animatingId, setAnimatingId] = useState(null);
  // Save for later logic
  const SAVE_KEY = 'pedido_cart_saved';
  const [hasSavedCart, setHasSavedCart] = useState(!!localStorage.getItem(SAVE_KEY));
  // Discount logic
  const [discountCode, setDiscountCode] = useState('');
  const [discountValid, setDiscountValid] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  // Cart sidebar/preview
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Multi-step checkout logic
  const [step, setStep] = useState(1);
  const cartCount = pedido.reduce((acc, p) => acc + p.cantidad, 0);
  // Feedback visual
  const [mensaje, setMensaje] = useState('');
  const [loadingPedido, setLoadingPedido] = useState(false);
  // Mesa y usuario (ajustar según tu lógica de selección de mesa y usuario)
  const [mesa, setMesa] = useState('');
  const usuario = localStorage.getItem('userId');

  // Función para enviar el pedido al backend
  const enviarPedido = async () => {
    if (!usuario) {
      setMensaje('Debes iniciar sesión para enviar el pedido.');
      setTimeout(() => setMensaje(''), 2000);
      return;
    }
    if (!mesa) {
      setMensaje('Selecciona una mesa.');
      setTimeout(() => setMensaje(''), 2000);
      return;
    }
    if (pedido.length === 0) {
      setMensaje('El carrito está vacío.');
      setTimeout(() => setMensaje(''), 2000);
      return;
    }
    setLoadingPedido(true);
    try {
      const productosPedido = pedido.map(p => ({ producto: p.producto._id, cantidad: p.cantidad }));
      await api.post('/api/pedidos', {
        productos: productosPedido,
        mesa,
        usuario
      });
      setMensaje('¡Pedido enviado correctamente!');
      setPedido([]);
      setTimeout(() => setMensaje(''), 2500);
    } catch (err) {
      setMensaje('Error al enviar el pedido.');
      setTimeout(() => setMensaje(''), 2500);
    }
    setLoadingPedido(false);
  };

  // Estimated preparation time logic
  const getEstimatedTime = () => {
    const base = 5;
    const perProduct = 10;
    const totalItems = pedido.reduce((acc, p) => acc + p.cantidad, 0);
    return base + perProduct * totalItems;
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(pedido));
  }, [pedido]);

  // Restore cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setPedido(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Discount code validation
  const validCodes = { 'PROMO10': 0.10, 'PROMO20': 0.20 };
  const handleDiscountCode = e => {
    const code = e.target.value.trim().toUpperCase();
    setDiscountCode(code);
    if (validCodes[code]) {
      setDiscountValid(true);
      setDiscountAmount(validCodes[code]);
    } else {
      setDiscountValid(false);
      setDiscountAmount(0);
    }
  };

  // Cart logic
  const agregarProducto = (producto, cantidad = 1, nota = '', opcion = '') => {
    setPedido(prev => {
      const existe = prev.find(p => p.producto._id === producto._id && p.nota === nota && p.opcion === opcion);
      if (existe) {
        setAnimatingId(producto._id);
        setTimeout(() => setAnimatingId(null), 700);
        return prev.map(p =>
          p.producto._id === producto._id && p.nota === nota && p.opcion === opcion
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      }
      setAnimatingId(producto._id);
      setTimeout(() => setAnimatingId(null), 700);
      return [...prev, { producto, cantidad, nota, opcion }];
    });
    setMensaje(`Agregado: ${producto.nombre} x${cantidad}${opcion ? ' (' + opcion + ')' : ''}${nota ? ' - ' + nota : ''}`);
    setTimeout(() => setMensaje(''), 1500);
  };

  const incrementar = id => {
    setPedido(prev => prev.map(p => p.producto._id === id ? { ...p, cantidad: p.cantidad + 1 } : p));
  };
  const decrementar = id => {
    setPedido(prev => prev.map(p => p.producto._id === id ? { ...p, cantidad: Math.max(1, p.cantidad - 1) } : p));
  };
  const eliminar = id => {
    const item = pedido.find(p => p.producto._id === id);
    if (item) {
      setAnimatingId(id);
      setTimeout(() => {
        setPedido(prev => prev.filter(p => p.producto._id !== id));
        setUndoItem(item);
        if (undoTimer) clearTimeout(undoTimer);
        const timer = setTimeout(() => setUndoItem(null), 4000);
        setUndoTimer(timer);
        setMensaje(`Producto eliminado: ${item.producto.nombre}`);
        setTimeout(() => setMensaje(''), 1500);
      }, 500);
    }
  };
  const quitarProducto = id => {
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

  // Multi-step checkout logic
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleConfirmOrder = () => {
    setShowModal(false);
    enviarPedido();
  };

  // Keyboard accessibility for steps and cart actions
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        if (showModal) handleCloseModal();
        if (showSidebar) setShowSidebar(false);
      }
      if (e.key === 'Enter') {
        if (showSidebar && document.activeElement && document.activeElement.dataset.action) {
          document.activeElement.click();
        }
        if (showModal && document.activeElement && document.activeElement.dataset.action) {
          document.activeElement.click();
        }
        if (step === 1 && pedido.length > 0) setStep(2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showSidebar, step, pedido.length]);


  // Calculate subtotal, total, and minimum order logic
  const subtotal = pedido.reduce((acc, p) => acc + p.producto.precio * p.cantidad, 0);
  const total = discountValid ? subtotal * (1 - discountAmount) : subtotal;

  // Main render
  return (
    <div>
      {/* Feedback visual */}
      {mensaje && (
        <div style={{
          background: mensaje.toLowerCase().includes('error') ? '#f8d7da' : '#e2f7e2',
          color: mensaje.toLowerCase().includes('error') ? '#721c24' : '#155724',
          border: mensaje.toLowerCase().includes('error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '0.75rem',
          marginBottom: '1rem',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '1rem'
        }}>
          {mensaje}
        </div>
      )}
      {/* ...existing code... */}
      {/* Cart Sidebar */}
      {showSidebar && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '340px', height: '100vh', background: '#fff', boxShadow: '-2px 0 12px rgba(0,0,0,0.12)', zIndex: 3000,
          display: 'flex', flexDirection: 'column', padding: '1.2rem', transition: 'right 0.3s', overflowY: 'auto' }} role="dialog" aria-modal="true" aria-label="Carrito de compras">
          {/* ...existing code... */}
          {pedido.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              {/* ...existing code... */}
              <p><strong>Tiempo estimado de preparación:</strong> {getEstimatedTime()} min</p>
              {/* ...existing code... */}
            </div>
          )}
        </div>
      )}
      {/* ...existing code... */}
      {/* Order Summary Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} role="dialog" aria-modal="true" aria-label="Confirmar pedido">
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', minWidth: '320px', maxWidth: '90vw' }}>
            {/* ...existing code... */}
            <p><strong>Tiempo estimado de preparación:</strong> {getEstimatedTime()} min</p>
            {/* ...existing code... */}
            <button onClick={enviarPedido} disabled={loadingPedido} style={{ marginTop: '1rem', background: '#28a745', color: '#fff', padding: '0.5rem 1.2rem', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}>
              {loadingPedido ? 'Enviando...' : 'Confirmar y enviar pedido'}
            </button>
          </div>
        </div>
      )}
      {/* ...existing code... */}
    </div>
  );
}

