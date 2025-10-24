// src/components/Layout.tsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X,
  Star,
  MessageCircle,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api, isAuthenticated } from '../services/api';

interface User {
  username: string;
  email: string;
  full_name?: string;
}

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const user = await api.auth.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error getting user:', error);
          // Si falla, probablemente el token expiró
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
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
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ShoppingBag className="h-8 w-8" />
              <span>E-Commerce</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`nav-link ${isActivePath('/') ? 'nav-link-active' : ''}`}
              >
                Inicio
              </Link>
              
              <Link
                to="/products"
                className={`nav-link ${isActivePath('/products') ? 'nav-link-active' : ''}`}
              >
                Productos
              </Link>

              {currentUser && (
                <>
                  <Link
                    to="/conversations"
                    className={`nav-link ${isActivePath('/conversations') ? 'nav-link-active' : ''}`}
                  >
                    <MessageCircle className="h-4 w-4 inline mr-1" />
                    Mensajes
                  </Link>
                  
                  <Link
                    to="/my-products"
                    className={`nav-link ${isActivePath('/my-products') ? 'nav-link-active' : ''}`}
                  >
                    Mis Productos
                  </Link>
                </>
              )}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/products/create"
                    className="btn-primary btn-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Vender</span>
                  </Link>
                  
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                      <User className="h-5 w-5" />
                      <span className="text-sm font-medium">{currentUser.username}</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Mi Perfil
                        </Link>
                        
                        <Link
                          to="/my-reviews"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Star className="h-4 w-4 inline mr-2" />
                          Mis Reseñas
                        </Link>
                        
                        <hr className="my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-outline">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-slide-in">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className={`nav-link ${isActivePath('/') ? 'nav-link-active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </Link>
                
                <Link
                  to="/products"
                  className={`nav-link ${isActivePath('/products') ? 'nav-link-active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Productos
                </Link>

                {currentUser ? (
                  <>
                    <Link
                      to="/conversations"
                      className={`nav-link ${isActivePath('/conversations') ? 'nav-link-active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      Mensajes
                    </Link>
                    
                    <Link
                      to="/my-products"
                      className={`nav-link ${isActivePath('/my-products') ? 'nav-link-active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Productos
                    </Link>
                    
                    <Link
                      to="/products/create"
                      className={`nav-link ${isActivePath('/products/create') ? 'nav-link-active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Vender Producto
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Conectado como: <span className="font-medium">{currentUser.username}</span>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="nav-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      Mi Perfil
                    </Link>
                    
                    <Link
                      to="/my-reviews"
                      className="nav-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Star className="h-4 w-4 inline mr-2" />
                      Mis Reseñas
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="nav-link text-red-600 hover:text-red-700 text-left w-full"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/login"
                      className="nav-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      className="nav-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">E-Commerce</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Tu plataforma de confianza para comprar y vender productos. 
                Conectamos compradores y vendedores en un entorno seguro y fácil de usar.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 E-Commerce. Proyecto Educativo - Programación 3.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Enlaces Rápidos
              </h3>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Inicio
                </Link>
                <Link to="/products" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Productos
                </Link>
                {currentUser && (
                  <Link to="/my-products" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Mis Productos
                  </Link>
                )}
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Soporte
              </h3>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Centro de Ayuda
                </a>
                <a href="#" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Términos de Servicio
                </a>
                <a href="#" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="block text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Contacto
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
