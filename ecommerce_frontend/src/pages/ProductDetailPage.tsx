import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../contexts/CartContext';

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
  vendedor_nombre_completo?: string;
  created_at: string;
}

interface Review {
  id: number;
  usuario_username: string;
  usuario_nombre: string;
  puntuacion: number;
  comentario: string;
  created_at: string;
}

interface ReviewsData {
  promedio: number;
  total: number;
  calificaciones: Review[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const data = await api.products.getById(parseInt(id));
        setProduct(data);
        
        // Verificar ownership
        try {
          const myProducts = await api.products.getMine();
          const ownsProduct = myProducts.some((p: any) => p.id === data.id);
          setIsOwner(ownsProduct);
        } catch (error) {
          setIsOwner(false);
        }
        
        // Cargar reseñas
        await loadReviews(data.id);
        
      } catch (err: any) {
        setError('Error al cargar el producto');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const loadReviews = async (productId: number) => {
    try {
      const reviewsData = await api.products.getReviews(productId);
      setReviews(reviewsData);
      
      try {
        const myReviewData = await api.products.getMyReview(productId);
        setMyReview(myReviewData);
      } catch (error) {
        setMyReview({ tiene_calificacion: false });
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    try {
      await api.products.addReview(product.id, {
        puntuacion: rating,
        comentario: comment.trim() || undefined
      });
      alert('¡Calificación enviada exitosamente!');
      setShowReviewForm(false);
      setRating(0);
      setComment('');
      await loadReviews(product.id);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al enviar calificación');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        vendedor_id: product.vendedor_id,
        stock: product.stock
      });
      alert('¡Producto agregado al carrito!');
    }
  };

  const handleContactSeller = async () => {
    if (!product || isCreatingConversation) return;
    
    setIsCreatingConversation(true);
    try {
      // Crear conversación
      const conversacion = await api.conversations.create(product.vendedor_id);
      
      // Redirigir al chat
      navigate(`/conversations/${conversacion.id}`);
    } catch (error: any) {
      console.error('Error creando conversación:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('conversación')) {
        // Ya existe la conversación, buscarla
        try {
          const conversations = await api.conversations.getAll();
          const existingConv = conversations.find((conv: any) => 
            conv.otro_usuario_id === product.vendedor_id
          );
          if (existingConv) {
            navigate(`/conversations/${existingConv.id}`);
          } else {
            alert('Error al contactar vendedor. Intenta nuevamente.');
          }
        } catch (e) {
          alert('Error al contactar vendedor. Intenta nuevamente.');
        }
      } else {
        alert('Error al contactar vendedor. Intenta nuevamente.');
      }
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false, onStarClick?: (star: number) => void) => {
  return [1, 2, 3, 4, 5].map(star => (
    <span
      key={star}
      onClick={() => interactive && onStarClick && onStarClick(star)}
      style={{
        fontSize: interactive ? '1.5rem' : '1rem',
        cursor: interactive ? 'pointer' : 'default',
        color: star <= currentRating ? '#fbbf24' : '#d1d5db',
        marginRight: '0.25rem',
        transition: interactive ? 'color 0.2s ease' : 'none'
      }}
      onMouseEnter={() => {
        if (interactive && onStarClick) {
          const starElements = document.querySelectorAll('.star-rating span');
          starElements.forEach((el, index) => {
            if (el instanceof HTMLElement) {
              el.style.color = index < star ? '#fbbf24' : '#d1d5db';
            }
          });
        }
      }}
      onMouseLeave={() => {
        if (interactive) {
          const starElements = document.querySelectorAll('.star-rating span');
          starElements.forEach((el, index) => {
            if (el instanceof HTMLElement) {
              el.style.color = index < currentRating ? '#fbbf24' : '#d1d5db';
            }
          });
        }
      }}
    >
      {star <= currentRating ? '⭐' : '☆'}
    </span>
  ));
};

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-8">{error || 'Producto no encontrado'}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Botón Volver */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              color: '#374151',
              fontSize: '1rem'
            }}
          >
            <span>←</span>
            <span>Volver</span>
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', 
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* IMAGEN DEL PRODUCTO */}
          <div>
            <div style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
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
                      parent.innerHTML = '<span style="font-size: 4rem; color: #9ca3af;">📦</span>';
                    }
                  }}
                />
              ) : (
                <span style={{ fontSize: '4rem', color: '#9ca3af' }}>📦</span>
              )}
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              {product.categoria && (
                <span style={{
                  backgroundColor: '#dbeafe',
                  color: '#2563eb',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {product.categoria}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.nombre}</h1>
            
            <div style={{ marginBottom: '2rem' }}>
              <p className="text-4xl font-bold" style={{ color: '#2563eb' }}>
                ${product.precio.toLocaleString()}
              </p>
            </div>

            {/* Calificaciones promedio */}
            {reviews && reviews.total > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {renderStars(Math.round(reviews.promedio))}
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {reviews.promedio.toFixed(1)} ({reviews.total} reseña{reviews.total !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.descripcion || 'Sin descripción disponible'}
              </p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f9fafb' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span className="text-gray-500 text-sm">Stock disponible:</span>
                  <p className="font-semibold">
                    {product.stock > 0 ? `${product.stock} unidades` : 'Sin stock'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Publicado:</span>
                  <p className="font-semibold">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DEL VENDEDOR */}
            {!isOwner && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vendedor</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>👤</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.vendedor_username || `Usuario ${product.vendedor_id}`}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={handleContactSeller}
                    disabled={isCreatingConversation}
                  >
                    <span>💬</span>
                    <span>{isCreatingConversation ? 'Contactando...' : 'Contactar'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SISTEMA DE CALIFICACIONES */}
            {!isOwner && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 className="text-lg font-semibold mb-3">⭐ Calificar Producto</h3>
                
                {myReview?.tiene_calificacion ? (
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    padding: '1rem', 
                    borderRadius: '0.375rem',
                    border: '1px solid #0ea5e9'
                  }}>
                    <p style={{ color: '#0c4a6e', fontWeight: '500', marginBottom: '0.5rem' }}>
                      Ya has calificado este producto
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {renderStars(myReview.calificacion.puntuacion)}
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {myReview.calificacion.comentario && `"${myReview.calificacion.comentario}"`}
                      </span>
                    </div>
                  </div>
                ) : !showReviewForm ? (
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="btn-outline"
                  >
                    Escribir Reseña
                  </button>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Calificación:</p>
                      <div 
                        className="star-rating" 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {renderStars(rating, true, setRating)}
                        <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          {rating > 0 ? `${rating} estrella${rating !== 1 ? 's' : ''}` : 'Selecciona una calificación'}
                        </span>
                      </div>
                    </div>
                    <textarea
                      placeholder="Escribe tu comentario (opcional)..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        marginBottom: '1rem',
                        resize: 'vertical',
                        minHeight: '80px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleSubmitReview} className="btn-primary">
                        Enviar Reseña
                      </button>
                      <button onClick={() => {
                        setShowReviewForm(false);
                        setRating(0);
                        setComment('');
                      }} className="btn-outline">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESEÑAS DE OTROS USUARIOS */}
            {reviews && reviews.calificaciones.length > 0 && (
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 className="text-lg font-semibold mb-3">💬 Reseñas de Usuarios</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reviews.calificaciones.map((review: Review) => (
                    <div key={review.id} style={{
                      padding: '1rem',
                      borderBottom: '1px solid #e5e7eb',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <div>
                          <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                            {review.usuario_username}
                          </p>
                          {renderStars(review.puntuacion)}
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comentario && (
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          "{review.comentario}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÓN AGREGAR AL CARRITO - SOLO PARA COMPRADORES */}
            {!isOwner && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    opacity: product.stock === 0 ? 0.5 : 1,
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            )}

            {/* MENSAJE PARA VENDEDOR */}
            {isOwner && (
              <div className="card" style={{ backgroundColor: '#f0f9ff', borderColor: '#0ea5e9', textAlign: 'center' }}>
                <p style={{ color: '#0c4a6e', fontWeight: '500' }}>
                  📊 Este es tu producto. Los compradores pueden calificarlo después de comprarlo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;