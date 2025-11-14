import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { CATEGORIAS } from '../constants';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  vendedor_nombre: string;
  fecha_creacion: string;
  puntuacion_promedio?: number;
  total_calificaciones?: number;
  imagen_url?: string;
  categoria?: string;
  stock?: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('fecha_desc');
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Leer parámetros de URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || ''; // ← CAMBIO: search en lugar de buscar
    const categoryParam = params.get('categoria') || '';
    const sortParam = params.get('orden') || 'fecha_desc';
    
    console.log('📍 URL params:', {
      search: searchParam,
      category: categoryParam, 
      sort: sortParam,
      fullURL: location.search
    });
    
    setSearchTerm(searchParam);
    setSelectedCategory(categoryParam);
    setSortBy(sortParam);
  }, [location.search]);

  // Cargar productos - SOLO cuando cambian categoría o sort (no searchTerm)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          skip: 0,
          limit: 50
        };
        
        console.log('🔄 Filter states:', { searchTerm, selectedCategory, sortBy });
        
        // Solo agregar search si viene de URL o submit del formulario
        const urlParams = new URLSearchParams(location.search);
        const urlSearch = urlParams.get('search') || '';
        
        if (urlSearch.trim()) {
          params.search = urlSearch.trim();
          console.log('🔍 Adding search param from URL:', params.search);
        }
        
        if (selectedCategory) {
          params.categoria = selectedCategory;
          console.log('🏷️ Adding category param:', params.categoria);
        }
        
        console.log('📡 Final API params:', params);
        
        const response = await api.products.getAll(params);
        
        console.log('📡 Raw API response:', response);
        
        // Extraer el array de productos de la respuesta (productos en español PRIMERO)
        const productsArray = response.productos || response.items || response.products || response.data || [];
        
        console.log('✅ Products found:', productsArray.length);
        
        // Ordenar productos según sortBy
        let sortedProducts = [...productsArray];
        switch (sortBy) {
          case 'precio_asc':
            sortedProducts.sort((a, b) => a.precio - b.precio);
            break;
          case 'precio_desc':
            sortedProducts.sort((a, b) => b.precio - a.precio);
            break;
          case 'nombre_asc':
            sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
          case 'fecha_desc':
          default:
            sortedProducts.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
            break;
        }
        
        setProducts(sortedProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy, location.search]); // ← CAMBIO: Removido searchTerm

  // Actualizar URL cuando cambian los filtros
  const updateURL = (newSearch?: string, newCategory?: string, newSort?: string) => {
    const params = new URLSearchParams();
    
    const search = newSearch !== undefined ? newSearch : searchTerm;
    const category = newCategory !== undefined ? newCategory : selectedCategory;
    const sort = newSort !== undefined ? newSort : sortBy;
    
    if (search.trim()) params.set('search', search); // ← CAMBIO: search en lugar de buscar
    if (category) params.set('categoria', category);
    if (sort !== 'fecha_desc') params.set('orden', sort);
    
    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ''}`, { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Search submitted with term:', searchTerm);
    updateURL(searchTerm); // Actualizar URL con el término actual
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(undefined, category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL(undefined, undefined, sort);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('fecha_desc');
    navigate('/products', { replace: true });
  };

  // Función para remover filtro específico
  const removeFilter = (filterType: 'search' | 'category') => {
    if (filterType === 'search') {
      setSearchTerm('');
      updateURL('');
    } else if (filterType === 'category') {
      setSelectedCategory('');
      updateURL(undefined, '');
    }
  };

  // Comprobar si hay filtros activos
  const hasActiveFilters = searchTerm.trim() || selectedCategory || sortBy !== 'fecha_desc';

  return (
    <div className="container-custom py-8">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Productos</h1>
          
          {/* Filtros aplicados */}
          {hasActiveFilters && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1e40af'
                  }}>
                    Filtros aplicados:
                  </span>
                  
                  {/* Filtro de búsqueda */}
                  {searchTerm.trim() && (
                    <span style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🔍 "{searchTerm}"
                      <button
                        onClick={() => removeFilter('search')}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '0.875rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {/* Filtro de categoría */}
                  {selectedCategory && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🏷️ {selectedCategory}
                      <button
                        onClick={() => removeFilter('category')}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '0.875rem'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {/* Filtro de orden */}
                  {sortBy !== 'fecha_desc' && (
                    <span style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      📊 {sortBy === 'precio_asc' ? 'Menor precio' : 
                           sortBy === 'precio_desc' ? 'Mayor precio' : 
                           'Alfabético'}
                    </span>
                  )}
                </div>
                
                {/* Botón limpiar todo */}
                <button
                  onClick={clearFilters}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                >
                  🗑️ Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controles de filtrado */}
        <div className="card mb-6">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e as any);
                  }
                }}
                placeholder="Buscar productos..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
              <button 
                type="submit"
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                🔍 Buscar
              </button>
            </div>
          </form>

          {/* Filtros */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            {/* Categoría */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Todas las categorías</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="fecha_desc">Más recientes</option>
                <option value="precio_asc">Menor precio</option>
                <option value="precio_desc">Mayor precio</option>
                <option value="nombre_asc">Alfabético (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {error ? (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Intenta con otros filtros o términos de búsqueda'
                : 'Aún no hay productos disponibles'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div style={{ 
              marginBottom: '1.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {products.length === 1 
                ? 'Se encontró 1 producto' 
                : `Se encontraron ${products.length} productos`}
              {hasActiveFilters && ' con los filtros aplicados'}
            </div>

            {/* Grid de productos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Botón para agregar producto */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link 
            to="/create-product" 
            className="btn-primary"
            style={{ display: 'inline-block' }}
          >
            + Publicar Producto
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;