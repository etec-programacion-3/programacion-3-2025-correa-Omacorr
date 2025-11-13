import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Order {
  id: number;
  total: number;
  estado: string;
  fecha_pedido: string;
  direccion_envio: string;
}

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  is_active: boolean;
  created_at: string;
  imagen_url?: string;
}

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'products' | 'address'>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAddressMode, setEditAddressMode] = useState(false);
  
  // Datos del usuario para editar
  const [userData, setUserData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigo_postal: ''
  });

  // Datos de dirección por separado
  const [addressData, setAddressData] = useState({
    direccion: '',
    ciudad: '',
    provincia: '',
    codigo_postal: ''
  });

  // Actualizar userData cuando user cambie
  useEffect(() => {
    if (user) {
      setUserData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        provincia: user.provincia || '',
        codigo_postal: user.codigo_postal || ''
      });
      
      setAddressData({
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        provincia: user.provincia || '',
        codigo_postal: user.codigo_postal || ''
      });
    }
  }, [user]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'orders') {
          const ordersData = await api.orders.getAll();
          setOrders(ordersData);
        } else if (activeTab === 'products') {
          const productsData = await api.products.getMine();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'info' && activeTab !== 'address') {
      loadData();
    }
  }, [activeTab]);

  // Validaciones (iguales al checkout)
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      if (cleaned.length > 1 && !cleaned.startsWith('+54')) {
        cleaned = '+54';
      }
      return cleaned.slice(0, 15);
    } else {
      return cleaned.slice(0, 11);
    }
  };

  const formatPostalCode = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 8);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones (iguales al checkout)
    if (userData.telefono && userData.telefono.replace(/\D/g, '').length < 8) {
      alert('El teléfono debe tener al menos 8 dígitos');
      return;
    }
    
    if (userData.nombre.trim().length < 2) {
      alert('El nombre debe tener al menos 2 caracteres');
      return;
    }
    
    if (userData.apellido.trim().length < 2) {
      alert('El apellido debe tener al menos 2 caracteres');
      return;
    }

    try {
      setLoading(true);
      await updateUser(userData);
      setEditMode(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de dirección
    if (addressData.codigo_postal && addressData.codigo_postal.length < 4) {
      alert('El código postal debe tener al menos 4 dígitos');
      return;
    }

    try {
      setLoading(true);
      await updateUser(addressData);
      setEditAddressMode(false);
      alert('Dirección actualizada exitosamente');
    } catch (error) {
      alert('Error al actualizar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return '#f59e0b';
      case 'confirmado': return '#10b981';
      case 'enviado': return '#3b82f6';
      case 'entregado': return '#059669';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente': return '⏳';
      case 'confirmado': return '✅';
      case 'enviado': return '🚚';
      case 'entregado': return '📦';
      case 'cancelado': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="container-custom py-8">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '3rem'
          }}>
            👤
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Miembro desde {user ? new Date(user.created_at).toLocaleDateString() : ''}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="card mb-6" style={{ padding: 0 }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #e5e7eb',
            overflow: 'auto'
          }}>
            {[
              { id: 'info', label: '👤 Información Personal' },
              { id: 'address', label: '📍 Mi Dirección' },
              { id: 'orders', label: '📦 Mis Pedidos' },
              { id: 'products', label: '🛍️ Mis Productos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '150px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'info' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem' // ← REDUCIDO el spacing
              }}>
                <h2 className="text-xl font-semibold">Información Personal</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    backgroundColor: editMode ? '#dc2626' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  {editMode ? '❌ Cancelar' : '✏️ Editar'}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={userData.nombre}
                          onChange={(e) => setUserData({...userData, nombre: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Apellido *
                        </label>
                        <input
                          type="text"
                          value={userData.apellido}
                          onChange={(e) => setUserData({...userData, apellido: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Teléfono
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                          (mínimo 8 dígitos)
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={userData.telefono}
                        onChange={(e) => setUserData({...userData, telefono: formatPhoneNumber(e.target.value)})}
                        placeholder="11 1234-5678 o +54 9 11 1234-5678"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{ marginTop: '1rem' }}
                    >
                      {loading ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                  {/* ← MOSTRAR TODA LA INFO */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>Nombre:</span>
                      <span style={{ color: '#111827' }}>{user?.nombre || 'No especificado'}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <span style={{ fontWeight: '500', color: '#374151' }}>Apellido:</span>
                      <span style={{ color: '#111827' }}>{user?.apellido || 'No especificado'}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Email:</span>
                    <span style={{ color: '#111827' }}>{user?.email}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Teléfono:</span>
                    <span style={{ color: '#111827' }}>{user?.telefono || 'No especificado'}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Usuario:</span>
                    <span style={{ color: '#111827' }}>{user?.username}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>Miembro desde:</span>
                    <span style={{ color: '#111827' }}>
                      {user ? new Date(user.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 className="text-xl font-semibold">Mi Dirección de Envío</h2>
                <button
                  onClick={() => setEditAddressMode(!editAddressMode)}
                  style={{
                    backgroundColor: editAddressMode ? '#dc2626' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  {editAddressMode ? '❌ Cancelar' : '✏️ Editar Dirección'}
                </button>
              </div>

              {editAddressMode ? (
                <form onSubmit={handleUpdateAddress}>
                  <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Dirección Completa
                      </label>
                      <input
                        type="text"
                        value={addressData.direccion}
                        onChange={(e) => setAddressData({...addressData, direccion: e.target.value})}
                        placeholder="Calle, número, piso, departamento"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={addressData.ciudad}
                          onChange={(e) => setAddressData({...addressData, ciudad: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Provincia
                        </label>
                        <input
                          type="text"
                          value={addressData.provincia}
                          onChange={(e) => setAddressData({...addressData, provincia: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Código Postal
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                            (mín 4)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={addressData.codigo_postal}
                          onChange={(e) => setAddressData({...addressData, codigo_postal: formatPostalCode(e.target.value)})}
                          placeholder="1234"
                          style={{
                            width: '100px',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{ marginTop: '1rem' }}
                    >
                      {loading ? 'Actualizando...' : 'Guardar Dirección'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ maxWidth: '600px' }}>
                  {user?.direccion || user?.ciudad || user?.provincia || user?.codigo_postal ? (
                    <div style={{
                      border: '2px solid #2563eb',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      backgroundColor: '#eff6ff'
                    }}>
                      <h4 className="font-semibold text-lg mb-3">📍 Dirección Principal</h4>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        <p><strong>Dirección:</strong> {user?.direccion || 'No especificada'}</p>
                        <p><strong>Ciudad:</strong> {user?.ciudad || 'No especificada'}</p>
                        <p><strong>Provincia:</strong> {user?.provincia || 'No especificada'}</p>
                        <p><strong>Código Postal:</strong> {user?.codigo_postal || 'No especificado'}</p>
                        <p><strong>País:</strong> Argentina</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
                      <h3 className="text-lg font-semibold mb-2">No tienes dirección configurada</h3>
                      <p className="text-gray-600 mb-4">Agrega tu dirección para facilitar tus compras</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Historial de Pedidos</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p style={{ marginTop: '1rem' }}>Cargando pedidos...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                  <h3 className="text-lg font-semibold mb-2">No tienes pedidos aún</h3>
                  <p className="text-gray-600 mb-4">¡Explora nuestros productos y haz tu primer pedido!</p>
                  <Link to="/products" className="btn-primary">
                    Ver Productos
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 className="font-semibold text-lg">Pedido #{order.id}</h4>
                          <p className="text-gray-600 text-sm">
                            {new Date(order.fecha_pedido).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            📍 {order.direccion_envio}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            backgroundColor: getStatusColor(order.estado),
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getStatusIcon(order.estado)}
                            {order.estado.toUpperCase()}
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            ${order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 className="text-xl font-semibold">Mis Productos</h2>
                <Link to="/sell" className="btn-primary">
                  + Publicar Producto
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p style={{ marginTop: '1rem' }}>Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</div>
                  <h3 className="text-lg font-semibold mb-2">No tienes productos publicados</h3>
                  <p className="text-gray-600 mb-4">¡Comienza a vender publicando tu primer producto!</p>
                  <Link to="/sell" className="btn-primary">
                    Publicar Producto
                  </Link>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {products.map(product => (
                    <div key={product.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}>
                      {/* Imagen mejorada */}
                      <div style={{
                        height: '200px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundImage: product.imagen_url ? `url(${product.imagen_url})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: product.imagen_url ? 'none' : '2px dashed #cbd5e1'
                      }}>
                        {!product.imagen_url && (
                          <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                            <p style={{ fontSize: '0.875rem' }}>Sin imagen</p>
                          </div>
                        )}
                        
                        {/* Badge de estado */}
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          backgroundColor: product.is_active ? '#10b981' : '#ef4444',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {product.is_active ? '✅ Activo' : '❌ Inactivo'}
                        </div>
                      </div>
                      
                      <div style={{ padding: '1.25rem' }}>
                        <h4 className="font-semibold text-gray-900 mb-2" style={{ 
                          fontSize: '1.1rem',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.nombre}
                        </h4>
                        
                        <p className="text-blue-600 font-bold text-xl mb-3">
                          ${product.precio.toLocaleString()}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span className="text-gray-600 text-sm">Stock: {product.stock}</span>
                          <span className="text-gray-500 text-xs">
                            {product.categoria || 'Sin categoría'}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/products/${product.id}/edit`}
                            style={{
                              flex: 1,
                              backgroundColor: '#2563eb',
                              color: 'white',
                              padding: '0.75rem',
                              textAlign: 'center',
                              borderRadius: '0.375rem',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            ✏️ Editar
                          </Link>
                          <Link
                            to={`/products/${product.id}`}
                            style={{
                              flex: 1,
                              backgroundColor: '#6b7280',
                              color: 'white',
                              padding: '0.75rem',
                              textAlign: 'center',
                              borderRadius: '0.375rem',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            👁️ Ver
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;