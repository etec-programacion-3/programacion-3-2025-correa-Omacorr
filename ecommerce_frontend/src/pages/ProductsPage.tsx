import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { CATEGORIAS } from '../constants';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen_url?: string;
  vendedor_id: number;
  vendedor_username?: string;
  vendedor_nombre?: string;
  created_at: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // Solo este se usa para buscar
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchParams] = useSearchParams();

  // Obtener categoría de la URL si viene de HomePage
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Cargar productos cuando cambien los filtros activos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Crear parámetros de búsqueda
        const params: any = {};
        if (activeSearchTerm.trim()) {
          params.search = activeSearchTerm.trim(); // ← CAMBIO: buscar → search
        }
        if (selectedCategory) {
          params.categoria = selectedCategory;
        }

        console.log('Parámetros de búsqueda:', params);
        
        const data = await api.products.getAll(params);
        console.log('Datos del backend:', data);
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && data.productos && Array.isArray(data.productos)) {
          setProducts(data.productos);
        } else if (data && data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.error('Estructura de datos inesperada:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeSearchTerm, selectedCategory]);

  // Función para manejar la búsqueda con Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchTerm(searchTerm);
  };

  // Función para manejar Enter en el input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setActiveSearchTerm(searchTerm);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Productos</h1>
        <p className="text-gray-600">Descubre increíbles productos de nuestra comunidad</p>
      </div>

      {/* Filtros */}
      <form onSubmit={handleSearchSubmit}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#2d3748',
                fontSize: '0.875rem'
              }}>
                🔍 Buscar productos (presiona Enter para buscar)
              </label>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2d3748';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#2d3748',
                fontSize: '0.875rem'
              }}>
                📂 Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '0.875rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  minWidth: '150px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2d3748';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#2d3748',
                  color: '#ffffff',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a202c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d3748';
                }}
              >
                Buscar
              </button>
            </div>
          </div>
          
          {/* Botón limpiar filtros */}
          {(activeSearchTerm || selectedCategory) && (
            <div style={{ marginTop: '1rem' }}>
              <button 
                type="button"
                onClick={clearFilters}
                style={{
                  backgroundColor: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  color: '#2d3748',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7fafc';
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Resumen */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {products.length === 0 ? 'No se encontraron productos' :
           products.length === 1 ? 'Mostrando 1 producto' : 
           `Mostrando ${products.length} productos`}
          {(activeSearchTerm || selectedCategory) && (
            <span style={{ color: '#2d3748', fontWeight: '500' }}>
              {activeSearchTerm && ` para "${activeSearchTerm}"`}
              {selectedCategory && ` en ${selectedCategory}`}
            </span>
          )}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div style={{
            maxWidth: '400px',
            margin: '0 auto',
            backgroundColor: '#f9fafb',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: '#dbeafe', 
              borderRadius: '0.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <span style={{ fontSize: '2rem' }}>🔍</span>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              No hay productos
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {activeSearchTerm || selectedCategory 
                ? 'No se encontraron productos que coincidan con tu búsqueda' 
                : 'No hay productos disponibles en este momento'
              }
            </p>
            <button 
              onClick={clearFilters}
              style={{
                backgroundColor: '#2d3748',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748';
              }}
            >
              Ver todos los productos
            </button>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}>
                {/* Imagen del producto */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f7fafc',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {product.imagen_url ? (
                    <img 
                      src={product.imagen_url} 
                      alt={product.nombre}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%);"><span style="font-size: 3rem; color: #9ca3af;">📦</span></div>';
                        }
                      }}
                    />
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%)'
                    }}>
                      <span style={{ fontSize: '3rem', color: '#9ca3af' }}>📦</span>
                    </div>
                  )}

                  {/* Badge de stock */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      ¡Últimos {product.stock}!
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Sin stock
                    </div>
                  )}
                </div>

                {/* Contenido del producto */}
                <div style={{ 
                  padding: '1.25rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Categoría */}
                  {product.categoria && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{
                        backgroundColor: '#e2e8f0',
                        color: '#2d3748',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {product.categoria}
                      </span>
                    </div>
                  )}

                  {/* Título */}
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: '#2d3748',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.nombre}
                  </h3>

                  {/* Descripción */}
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.5rem',
                    flex: 1,
                    lineHeight: '1.4'
                  }}>
                    {product.descripcion || 'Sin descripción disponible'}
                  </p>

                  {/* Precio */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <p style={{ 
                        color: '#2d3748', 
                        fontWeight: 'bold', 
                        fontSize: '1.25rem',
                        margin: 0 
                      }}>
                        ${product.precio.toLocaleString()}
                      </p>
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.875rem',
                        margin: 0 
                      }}>
                        Stock: {product.stock}
                      </p>
                    </div>

                    {/* Vendedor */}
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span>👤</span>
                      <span>
                        {product.vendedor_nombre || product.vendedor_username || `Usuario ${product.vendedor_id}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;