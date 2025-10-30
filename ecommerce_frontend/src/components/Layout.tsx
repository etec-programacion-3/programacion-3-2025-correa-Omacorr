import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navbar dinámico */}
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>
            E-Commerce
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#374151' }}>Inicio</Link>
            <Link to="/products" style={{ textDecoration: 'none', color: '#374151' }}>Productos</Link>
            
            {isAuthenticated ? (
              // Menú para usuario autenticado
              <>
                <span style={{ color: '#6b7280' }}>Hola, {user?.username}!</span>
                <button 
                  onClick={logout}
                  className="btn" 
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  Logout
                </button>
              </>
            ) : (
              // Menú para usuario no autenticado
              <>
                <Link to="/login" className="btn" style={{ border: '1px solid #d1d5db' }}>Login</Link>
                <Link to="/register" className="btn btn-primary">Registro</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
