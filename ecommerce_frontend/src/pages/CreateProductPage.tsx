import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Tag, DollarSign, Hash, FileText } from 'lucide-react';
import { api } from '../services/api';
import { CATEGORIAS } from '../constants';

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validación nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede superar los 100 caracteres';
    }

    // Validación precio
    if (!formData.precio.trim()) {
      newErrors.precio = 'El precio es obligatorio';
    } else if (parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    } else if (parseFloat(formData.precio) > 999999999) {
      newErrors.precio = 'El precio es demasiado alto';
    }

    // Validación stock
    if (!formData.stock.trim()) {
      newErrors.stock = 'El stock es obligatorio';
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock debe ser 0 o mayor';
    } else if (parseInt(formData.stock) > 99999) {
      newErrors.stock = 'El stock es demasiado alto';
    }

    // Validación descripción (opcional pero con límite)
    if (formData.descripcion.length > 1000) {
      newErrors.descripcion = 'La descripción no puede superar los 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Formateo para precio (solo números y punto decimal)
    if (name === 'precio') {
      const cleaned = value.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) return;
      if (parts[1] && parts[1].length > 2) return;
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    }
    // Formateo para stock (solo números enteros)
    else if (name === 'stock') {
      const cleaned = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    }
    // Otros campos sin formateo especial
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await api.products.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: formData.categoria || undefined
      });
      
      alert('¡Producto publicado exitosamente!');
      navigate('/profile?tab=products');
      
    } catch (error: any) {
      console.error('Error creando producto:', error);
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          setErrors({ general: error.response.data.detail });
        } else if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail.map((err: any) => err.msg).join(', ');
          setErrors({ general: validationErrors });
        } else {
          setErrors({ general: 'Error al crear el producto' });
        }
      } else {
        setErrors({ general: 'Error al crear el producto. Intenta nuevamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '3rem',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#2d3748',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Package style={{ height: '28px', width: '28px', color: '#ffffff' }} />
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#2d3748', 
            marginBottom: '0.5rem' 
          }}>
            Publicar Producto
          </h1>
          <p style={{ color: '#718096', fontSize: '1rem' }}>
            Comparte lo que quieres vender con nuestra comunidad
          </p>
        </div>

        {/* Error general */}
        {errors.general && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#c53030',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {errors.general}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Nombre del Producto */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Nombre del Producto *
            </label>
            <div style={{ position: 'relative' }}>
              <Package style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '18px',
                width: '18px',
                color: '#a0aec0'
              }} />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                  border: errors.nombre ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.nombre) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.nombre) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="Ej: iPhone 13 Pro Max 128GB"
              />
            </div>
            {errors.nombre && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.nombre}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
              {formData.nombre.length}/100 caracteres
            </span>
          </div>

          {/* Categoría */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Categoría
            </label>
            <div style={{ position: 'relative' }}>
              <Tag style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '18px',
                width: '18px',
                color: '#a0aec0',
                zIndex: 1
              }} />
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                  border: errors.categoria ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
                onFocus={(e) => {
                  if (!errors.categoria) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.categoria) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIAS.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoria && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.categoria}
              </span>
            )}
          </div>

          {/* Precio y Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Precio *
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '18px',
                  width: '18px',
                  color: '#a0aec0'
                }} />
                <input
                  type="text"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 0.875rem 0.875rem 3rem',
                    border: errors.precio ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.precio) {
                      e.target.style.borderColor = '#2d3748';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.precio) {
                      e.target.style.borderColor = '#e2e8f0';
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
              {errors.precio && (
                <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                  {errors.precio}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
                Precio en pesos argentinos
              </span>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Stock *
              </label>
              <div style={{ position: 'relative' }}>
                <Hash style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '18px',
                  width: '18px',
                  color: '#a0aec0'
                }} />
                <input
                  type="text"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 0.875rem 0.875rem 3rem',
                    border: errors.stock ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                  onFocus={(e) => {
                    if (!errors.stock) {
                      e.target.style.borderColor = '#2d3748';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.stock) {
                      e.target.style.borderColor = '#e2e8f0';
                    }
                  }}
                  placeholder="1"
                />
              </div>
              {errors.stock && (
                <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                  {errors.stock}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
                Unidades
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Descripción (Opcional)
            </label>
            <div style={{ position: 'relative' }}>
              <FileText style={{
                position: 'absolute',
                left: '0.875rem',
                top: '1rem',
                height: '18px',
                width: '18px',
                color: '#a0aec0'
              }} />
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                  border: errors.descripcion ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  if (!errors.descripcion) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.descripcion) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="Describe tu producto: estado, características especiales, motivo de venta..."
              />
            </div>
            {errors.descripcion && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.descripcion}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
              {formData.descripcion.length}/1000 caracteres
            </span>
          </div>

          {/* Nota sobre imágenes */}
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📷</span>
            <div>
              <h4 style={{
                color: '#92400e',
                fontWeight: '600',
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Subida de imágenes próximamente
              </h4>
              <p style={{
                color: '#92400e',
                fontSize: '0.75rem',
                margin: 0
              }}>
                Por ahora los productos se publican sin imagen. Pronto podrás subir fotos.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/profile?tab=products')}
              style={{
                padding: '0.875rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                border: '2px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#2d3748',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7fafc';
                e.currentTarget.style.borderColor = '#2d3748';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.875rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                backgroundColor: isLoading ? '#a0aec0' : '#2d3748',
                color: '#ffffff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#48bb78';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2d3748';
                }
              }}
            >
              {isLoading ? 'Publicando...' : 'Publicar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;