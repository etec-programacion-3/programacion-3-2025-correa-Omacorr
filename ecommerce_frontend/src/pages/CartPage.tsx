import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      removeFromCart(productId);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar items para el backend
      const orderItems = items.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      console.log('Enviando pedido:', { items: orderItems });

      // Crear el pedido
      const response = await api.orders.create(orderItems);
      
      console.log('Pedido creado:', response);

      // Limpiar carrito
      clearCart();

      // Mostrar mensaje de éxito
      alert(`¡Pedido creado exitosamente! 🎉\nID del pedido: ${response.pedido_id}\nTotal: $${response.total.toLocaleString()}`);

      // Redirigir a página de confirmación o productos
      navigate('/products');

    } catch (err: any) {
      console.error('Error en checkout:', err);
      setError(err.response?.data?.detail || 'Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">
            ¡Encuentra productos increíbles en nuestra tienda!
          </p>
          <Link 
            to="/products" 
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mi Carrito</h1>
        <p className="text-gray-600">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Lista de productos */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 className="text-xl font-semibold text-gray-900">
              Productos ({totalItems})
            </h2>
          </div>
          
          <div>
            {items.map((item, index) => (
              <div 
                key={item.id} 
                style={{
                  padding: '1.5rem',
                  borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                {/* Imagen placeholder */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '2rem', color: '#9ca3af' }}>📦</span>
                </div>

                {/* Info del producto */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    Precio unitario: ${item.precio.toLocaleString()}
                  </p>
                  {item.stock && (
                    <p className="text-gray-500 text-xs">
                      Stock disponible: {item.stock}
                    </p>
                  )}
                </div>

                {/* Controles de cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      cursor: item.cantidad <= 1 ? 'not-allowed' : 'pointer',
                      opacity: item.cantidad <= 1 ? 0.5 : 1
                    }}
                  >
                    -
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={item.stock || 999}
                    value={item.cantidad}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1;
                      if (newQty > 0 && (!item.stock || newQty <= item.stock)) {
                        handleUpdateQuantity(item.id, newQty);
                      }
                    }}
                    style={{
                      width: '3rem',
                      textAlign: 'center',
                      padding: '0.25rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem'
                    }}
                  />
                  
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                    disabled={item.stock ? item.cantidad >= item.stock : false}
                    style={{
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      cursor: (item.stock && item.cantidad >= item.stock) ? 'not-allowed' : 'pointer',
                      opacity: (item.stock && item.cantidad >= item.stock) ? 0.5 : 1
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal y eliminar */}
                <div style={{ textAlign: 'right' }}>
                  <p className="font-bold text-lg text-gray-900 mb-2">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={{
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Resumen del Pedido
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              color: '#6b7280'
            }}>
              <span>Subtotal ({totalItems} productos)</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem',
              color: '#6b7280'
            }}>
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            
            <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#111827'
            }}>
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                Procesando...
              </span>
            ) : (
              `💳 Proceder al Pago ($${totalPrice.toLocaleString()})`
            )}
          </button>

          <button
            onClick={() => navigate('/products')}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#2563eb',
              padding: '0.75rem',
              border: '2px solid #2563eb',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#2563eb';
            }}
          >
            Seguir Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;