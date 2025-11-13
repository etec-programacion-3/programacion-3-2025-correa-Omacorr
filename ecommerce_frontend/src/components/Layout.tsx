import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  MessageCircle,
  Plus,
  ShoppingCart,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api, isAuthenticated } from '../services/api';

interface User {
  username: string;
  email: string;
  full_name?: string;
  direccion?: string;
  telefono?: string;
}

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { totalItems } = useCart();

  // Verificar autenticación al cargar
  useEffect(() => {
  const checkAuth = async () => {
    console.log('=== CHECKING AUTH IN:', location.pathname, '===');
    
    if (isAuthenticated()) {
      try {
        const user = await api.auth.getCurrentUser();
        console.log('Usuario encontrado:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error auth:', error);
        setCurrentUser(null);
      }
    } else {
      console.log('No authenticated');
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  checkAuth();
}, [location.pathname]);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    navigate('/');
    setShowUserMenu(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Cerrar menú cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  // Función para formatear dirección
  const getFormattedAddress = () => {
    if (currentUser?.direccion) {
      return currentUser.direccion.length > 25 
        ? currentUser.direccion.substring(0, 25) + '...' 
        : currentUser.direccion;
    }
    return 'Agregar dirección...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - Logo a la izquierda, contenido no centrado */}
      <nav style={{
        backgroundColor: '#2d3748',
        borderBottom: '1px solid #4a5568',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '100%',
          margin: '0',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '60px',
            justifyContent: 'flex-start',
            gap: '2rem'
          }}>
            
            {/* Logo completamente a la izquierda */}
            <Link 
              to="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ShoppingBag style={{ height: '28px', width: '28px' }} />
              <span>E-Commerce</span>
            </Link>

            {/* Botón "Enviar a" - Siempre visible */}
            {currentUser && (
              <button
                onClick={() => navigate('/profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.25rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <MapPin style={{ height: '16px', width: '16px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e0' }}>Enviar a</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {getFormattedAddress()}
                  </span>
                </div>
              </button>
            )}

            {/* Navegación Central */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', marginRight: '2rem' }}>
              <Link
                to="/products"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.25rem',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  border: isActivePath('/products') ? '1px solid #ffffff' : '1px solid transparent',
                  backgroundColor: isActivePath('/products') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  if (!isActivePath('/products')) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath('/products')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Productos
              </Link>

              {currentUser && (
                <>
                  <Link
                    to="/conversations"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.25rem',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: isActivePath('/conversations') ? '1px solid #ffffff' : '1px solid transparent',
                      backgroundColor: isActivePath('/conversations') ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/conversations')) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/conversations')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <MessageCircle style={{ height: '16px', width: '16px' }} />
                    Mensajes
                  </Link>
                  
                  <Link
                    to="/my-products"
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.25rem',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      border: isActivePath('/my-products') ? '1px solid #ffffff' : '1px solid transparent',
                      backgroundColor: isActivePath('/my-products') ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/my-products')) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/my-products')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Mis Productos
                  </Link>
                </>
              )}
            </div>

            {/* Área derecha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {currentUser ? (
                <>
                  {/* Carrito */}
                  <Link
                    to="/cart"
                    style={{
                      position: 'relative',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.25rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#ffffff',
                      border: isActivePath('/cart') ? '1px solid #ffffff' : '1px solid transparent',
                      backgroundColor: isActivePath('/cart') ? 'rgba(255,255,255,0.1)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/cart')) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/cart')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <ShoppingCart style={{ height: '20px', width: '20px' }} />
                    <span style={{ fontSize: '0.9rem' }}>Carrito</span>
                    {totalItems > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        backgroundColor: '#e53e3e',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>

                  {/* Botón Vender */}
                  <Link
                    to="/products/create"
                    style={{
                      backgroundColor: '#68d391',
                      color: '#1a202c',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '0.25rem',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#48bb78';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#68d391';
                    }}
                  >
                    <Plus style={{ height: '16px', width: '16px' }} />
                    Vender
                  </Link>

                  {/* Avatar y Menú de Usuario con click funcional */}
                  <div style={{ position: 'relative' }} className="user-menu">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: showUserMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '0.25rem',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!showUserMenu) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showUserMenu) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {/* Avatar circular */}
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#718096',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}>
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e0' }}>Hola,</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{currentUser.username}</div>
                      </div>
                      
                      <ChevronDown style={{ 
                        height: '14px', 
                        width: '14px',
                        transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        width: '200px',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        zIndex: 1000
                      }}>
                        <div style={{ padding: '0.75rem 0' }}>
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              color: '#2d3748',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f7fafc';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <User style={{ height: '16px', width: '16px', marginRight: '0.75rem' }} />
                            Mi Perfil
                          </Link>
                          
                          <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                          
                          <button
                            onClick={handleLogout}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              color: '#e53e3e',
                              backgroundColor: 'transparent',
                              border: 'none',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fed7d7';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <LogOut style={{ height: '16px', width: '16px', marginRight: '0.75rem' }} />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Botones para usuarios no autenticados */
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link 
                    to="/login" 
                    style={{
                      color: '#ffffff',
                      border: '1px solid #a0aec0',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#2d3748';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register" 
                    style={{
                      backgroundColor: '#68d391',
                      color: '#1a202c',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#48bb78';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#68d391';
                    }}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer mejorado */}
      <footer style={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        borderTop: '1px solid #4a5568',
        marginTop: 'auto',
        color: '#ffffff'
      }}>
        <div className="container-custom py-8">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            
            {/* Lado izquierdo - Logo y info principal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag style={{ height: '24px', width: '24px', color: '#ffffff' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff' }}>
                  E-Commerce
                </span>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem',
                  color: '#cbd5e0'
                }}>
                  v1.0
                </span>
              </div>
              
              <p style={{ color: '#cbd5e0', fontSize: '0.875rem', margin: 0 }}>
                Tu plataforma de confianza para comprar y vender productos
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                  © 2025 E-Commerce - Programación 3
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#48bb78', 
                    borderRadius: '50%' 
                  }}></span>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e0' }}>
                    Todos los servicios operativos
                  </span>
                </div>
              </div>
            </div>

            {/* Lado derecho - Links y badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              
              {/* Links rápidos */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link to="/products" style={{ 
                  color: '#cbd5e0', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}>
                  Productos
                </Link>
                {currentUser && (
                  <Link to="/my-products" style={{ 
                    color: '#cbd5e0', 
                    textDecoration: 'none', 
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}>
                    Mis Productos
                  </Link>
                )}
                <button
                  onClick={() => alert('Centro de ayuda próximamente')}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e0', 
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}>
                  Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;