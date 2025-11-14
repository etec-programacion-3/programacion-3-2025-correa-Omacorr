import { Link } from 'react-router-dom';
import { CATEGORIAS_ICONOS } from '../constants';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  vendedor_nombre: string;
  vendedor_id?: number;
  vendedor_username?: string;
  fecha_creacion: string;
  puntuacion_promedio?: number;
  total_calificaciones?: number;
  imagen_url?: string;
  categoria?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // 🔍 LOG DE DIAGNÓSTICO - Ver datos del vendedor
  console.log('👤 Product vendor data:', {
    vendedor_nombre: product.vendedor_nombre,
    vendedor_username: product.vendedor_username, 
    vendedor_id: product.vendedor_id,
    fullProduct: product
  });

  // Función para mostrar estrellas de calificación
  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">Sin calificar</span>;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} style={{ color: '#fbbf24' }}>☆</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#d1d5db' }}>☆</span>);
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <div>{stars}</div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          ({product.total_calificaciones || 0})
        </span>
      </div>
    );
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semana${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        e.currentTarget.style.borderColor = '#2563eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
      >
        {/* Imagen */}
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
            <div style={{ 
              textAlign: 'center', 
              color: '#64748b',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
              <p style={{ fontSize: '0.75rem', margin: 0 }}>Sin imagen</p>
            </div>
          )}
          
          {/* Badge de categoría */}
          {product.categoria && (
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              left: '0.5rem',
              backgroundColor: 'rgba(37, 99, 235, 0.9)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              {CATEGORIAS_ICONOS[product.categoria as keyof typeof CATEGORIAS_ICONOS] || '📦'}
              {product.categoria}
            </div>
          )}
          
          {/* Badge de stock bajo */}
          {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(245, 158, 11, 0.9)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              ¡Últimas {product.stock}!
            </div>
          )}
          
          {/* Badge sin stock */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              Sin stock
            </div>
          )}
        </div>

        {/* Contenido */}
        <div style={{ 
          padding: '1.25rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Título */}
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.5rem',
            lineHeight: '1.4',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.nombre}
          </h3>

          {/* Precio */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb'
            }}>
              ${product.precio.toLocaleString()}
            </span>
          </div>

          {/* Calificación */}
          <div style={{ marginBottom: '0.75rem' }}>
            {renderStars(product.puntuacion_promedio)}
          </div>

          {/* Vendedor */}
          <div style={{ 
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <span style={{ fontWeight: '500' }}>Vendedor:</span> {
              product.vendedor_nombre || 
              product.vendedor_username || 
              `Usuario ${product.vendedor_id || 'Desconocido'}`
            }
          </div>

          {/* Stock (si está disponible) */}
          {product.stock !== undefined && (
            <div style={{ 
              marginBottom: '0.75rem',
              fontSize: '0.875rem',
              color: product.stock > 10 ? '#059669' : product.stock > 0 ? '#f59e0b' : '#dc2626'
            }}>
              {product.stock > 0 ? (
                <>
                  <span style={{ fontWeight: '500' }}>Stock:</span> {product.stock} unidades
                </>
              ) : (
                <span style={{ fontWeight: '500' }}>Sin stock disponible</span>
              )}
            </div>
          )}

          {/* Fecha - al final */}
          <div style={{ 
            marginTop: 'auto',
            fontSize: '0.75rem',
            color: '#9ca3af',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f3f4f6'
          }}>
            {formatDate(product.fecha_creacion)}
          </div>
        </div>

        {/* Botón de acción (hover) */}
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <span style={{
            color: '#2563eb',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {product.stock === 0 ? 'Ver detalles' : 'Ver producto →'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;