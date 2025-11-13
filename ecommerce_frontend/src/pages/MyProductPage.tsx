import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen_url?: string;
  is_active: boolean;
  created_at: string;
}

const MyProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMyProducts = async () => {
      try {
        const data = await api.products.getMine();
        setProducts(data);
      } catch (err: any) {
        setError('Error al cargar tus productos');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMyProducts();
  }, []);

  const handleDelete = async (productId: number, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      try {
        await api.products.delete(productId);
        // Actualizar la lista eliminando el producto del estado local
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (productId: number) => {
    navigate(`/products/${productId}/edit`);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando tus productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mis Productos</h1>
        <p className="text-gray-600 mb-6">Gestiona todos tus productos publicados</p>
        
        <Link 
          to="/sell" 
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          + Agregar Nuevo Producto
        </Link>
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

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes productos publicados
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza a vender publicando tu primer producto
          </p>
          <Link 
            to="/sell" 
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Publicar Primer Producto
          </Link>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {products.map((product) => (
            <div key={product.id} className="card" style={{ overflow: 'hidden' }}>
              {/* Imagen del producto */}
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f3f4f6',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {product.imagen_url ? (
                  <img 
                    src={product.imagen_url} 
                    alt={product.nombre}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6;"><span style="font-size: 3rem; color: #9ca3af;">📦</span></div>';
                      }
                    }}
                  />
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    background: '#f3f4f6'
                  }}>
                    <span style={{ fontSize: '3rem', color: '#9ca3af' }}>📦</span>
                  </div>
                )}

                {/* Estado del producto */}
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  backgroundColor: product.is_active ? '#10b981' : '#dc2626',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </div>
              </div>

              {/* Contenido */}
              <div style={{ padding: '1.5rem' }}>
                {/* Categoría */}
                {product.categoria && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
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
                <h3 className="font-bold text-lg mb-2 text-gray-900" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.nombre}
                </h3>

                {/* Descripción */}
                <p className="text-gray-600 text-sm mb-3" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.5rem'
                }}>
                  {product.descripcion || 'Sin descripción'}
                </p>

                {/* Precio y Stock */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <p className="text-blue-600 font-bold text-xl">
                    ${product.precio.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Stock: {product.stock}
                  </p>
                </div>

                {/* Fecha de creación */}
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  marginBottom: '1rem'
                }}>
                  Publicado: {new Date(product.created_at).toLocaleDateString()}
                </p>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(product.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.nombre)}
                    style={{
                      flex: 1,
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                  >
                    🗑️ Eliminar
                  </button>

                  <Link
                    to={`/products/${product.id}`}
                    style={{
                      flex: 1,
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#6b7280';
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
  );
};

export default MyProductsPage;