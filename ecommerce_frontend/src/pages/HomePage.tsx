import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, ArrowRight, Smartphone, Home, Car, Shirt } from 'lucide-react';
import { api, isAuthenticated } from '../services/api';
import { CATEGORIAS_ICONOS } from '../constants';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  categoria?: string;
  calificacion_promedio?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Categorías con íconos
  // Crear categorías dinámicamente desde constants
  const categories = Object.keys(CATEGORIAS_ICONOS).map((nombre) => {
    const colorMap: Record<string, string> = {
      'Tecnología': '#3b82f6',
      'Hogar': '#10b981', 
      'Ropa': '#f59e0b',
      'Deportes': '#ef4444',
      'Vehículos': '#8b5cf6',
      'Libros': '#06b6d4',
      'Otros': '#6b7280'
    };
    
    const iconMap: Record<string, any> = {
      'Tecnología': Smartphone,
      'Hogar': Home,
      'Ropa': Shirt, 
      'Deportes': Star,
      'Vehículos': Car,
      'Libros': ShoppingBag,
      'Otros': ShoppingBag
    };
    
    return {
      name: nombre,
      icon: iconMap[nombre] || ShoppingBag,
      color: colorMap[nombre] || '#6b7280'
    };
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const user = await api.auth.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error checking auth:', error);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // Obtener productos y seleccionar algunos al azar
        const data = await api.products.getAll();
        console.log('Datos productos para HomePage:', data);
        
        // Manejar diferentes estructuras de respuesta
        let products: Product[] = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data && data.productos && Array.isArray(data.productos)) {
          products = data.productos;
        } else if (data && data.data && Array.isArray(data.data)) {
          products = data.data;
        } else {
          console.warn('No se pudieron cargar productos para HomePage:', data);
          products = [];
        }
        
        // Solo intentar ordenar si tenemos un array válido con elementos
        if (products && products.length > 0) {
          const shuffled = [...products].sort(() => 0.5 - Math.random());
          setFeaturedProducts(shuffled.slice(0, 6));
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setFeaturedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedProducts();
  }, []);

  const handleCategoryClick = (category: string) => {
    navigate(`/products?categoria=${encodeURIComponent(category)}`);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        color: '#ffffff',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container-custom">
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Tu Marketplace de Confianza
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            color: '#cbd5e0',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Compra y vende productos de manera fácil y segura. Conectamos compradores y vendedores con las mejores herramientas.
          </p>
          
          {!currentUser ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/register"
                style={{
                  backgroundColor: '#68d391',
                  color: '#1a202c',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#48bb78';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#68d391';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Crear Cuenta Gratis
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/products"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.5rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
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
                Explorar Productos
              </Link>
            </div>
          ) : (
            <Link 
              to="/products"
              style={{
                backgroundColor: '#68d391',
                color: '#1a202c',
                padding: '0.875rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#48bb78';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#68d391';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ShoppingBag size={20} />
              Comenzar a Comprar
            </Link>
          )}
        </div>
      </section>

      {/* Categorías */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff' }}>
        <div className="container-custom">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#2d3748'
          }}>
            Explora por Categorías
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = category.color;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <IconComponent 
                    size={40} 
                    style={{ 
                      color: category.color, 
                      marginBottom: '1rem',
                      margin: '0 auto 1rem' 
                    }} 
                  />
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    margin: 0
                  }}>
                    {category.name}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f7fafc' }}>
        <div className="container-custom">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#2d3748',
              margin: 0
            }}>
              Productos Destacados
            </h2>
            <Link 
              to="/products"
              style={{
                color: '#2d3748',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Ver todos
              <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  backgroundColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  height: '350px',
                  animation: 'pulse 2s infinite'
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                    border: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    height: '200px',
                    backgroundColor: '#f7fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: product.imagen_url ? `url(${product.imagen_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!product.imagen_url && (
                      <ShoppingBag size={48} style={{ color: '#a0aec0' }} />
                    )}
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {product.nombre}
                    </h3>
                    
                    <p style={{
                      color: '#718096',
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.descripcion}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#2d3748'
                      }}>
                        ${product.precio?.toLocaleString()}
                      </span>
                      
                      {product.calificacion_promedio && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                          <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                            {product.calificacion_promedio.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Final */}
      {!currentUser && (
        <section style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
          color: '#ffffff',
          padding: '4rem 0',
          textAlign: 'center'
        }}>
          <div className="container-custom">
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              ¿Listo para comenzar?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              color: '#cbd5e0'
            }}>
              Únete a miles de usuarios que ya confían en nuestra plataforma
            </p>
            <Link 
              to="/register"
              style={{
                backgroundColor: '#68d391',
                color: '#1a202c',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#48bb78';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#68d391';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Crear mi cuenta ahora
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;