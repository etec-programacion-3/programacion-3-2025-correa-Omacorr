import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Lock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validación username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    // Validación email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Validación nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Validación apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    // Validación contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validación confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validación en tiempo real para confirmar contraseña
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword' && formData.password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else if (name === 'password' && formData.confirmPassword && formData.confirmPassword !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
      } else if (formData.password === value || (name === 'password' && formData.confirmPassword === value)) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        direccion: formData.direccion.trim() || undefined, // ← ARREGLADO: null → undefined
        telefono: formData.telefono.trim() || undefined, // ← ARREGLADO: null → undefined
        password: formData.password
      };

      await api.auth.register(registerData);
      
      alert('¡Cuenta creada exitosamente!');
      navigate('/login');
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.response?.data?.detail) {
        if (error.response.data.detail.includes('username')) {
          setErrors({ username: 'Este nombre de usuario ya existe' });
        } else if (error.response.data.detail.includes('email')) {
          setErrors({ email: 'Este email ya está registrado' });
        } else {
          setErrors({ general: error.response.data.detail });
        }
      } else {
        setErrors({ general: 'Error al crear la cuenta. Intenta nuevamente.' });
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
            <User style={{ height: '28px', width: '28px', color: '#ffffff' }} />
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#2d3748', 
            marginBottom: '0.5rem' 
          }}>
            Crear Cuenta
          </h1>
          <p style={{ color: '#718096', fontSize: '1rem' }}>
            Únete a nuestra comunidad de compradores y vendedores
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
          
          {/* Nombres */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
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
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                  {errors.nombre}
                </span>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: errors.apellido ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.apellido) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.apellido) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="Tu apellido"
              />
              {errors.apellido && (
                <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                  {errors.apellido}
                </span>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Nombre de Usuario *
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                  border: errors.username ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="usuario123"
              />
            </div>
            {errors.username && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.username}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '18px',
                width: '18px',
                color: '#a0aec0'
              }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 0.875rem 0.875rem 3rem',
                  border: errors.email ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Dirección y Teléfono */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Dirección (opcional)
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2d3748';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
                placeholder="Calle, Ciudad, Provincia"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2d3748';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                }}
                placeholder="+54 123 456 7890"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '18px',
                width: '18px',
                color: '#a0aec0',
                zIndex: 1
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 3.5rem 0.875rem 3rem',
                  border: errors.password ? '2px solid #e53e3e' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  color: '#2d3748',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d3748';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7fafc';
                  e.currentTarget.style.color = '#2d3748';
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#2d3748',
              marginBottom: '0.5rem'
            }}>
              Confirmar Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '18px',
                width: '18px',
                color: '#a0aec0',
                zIndex: 1
              }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 3.5rem 0.875rem 3rem',
                  border: errors.confirmPassword ? '2px solid #e53e3e' : 
                         (formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword) ? '2px solid #2d3748' : '2px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.borderColor = '#2d3748';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword && formData.password === formData.confirmPassword) {
                    e.target.style.borderColor = '#2d3748';
                  } else if (!errors.confirmPassword) {
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
                placeholder="Repite tu contraseña"
              />
              <div style={{
                position: 'absolute',
                right: '0.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                zIndex: 10
              }}>
                {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle style={{
                    height: '18px',
                    width: '18px',
                    color: '#2d3748'
                  }} />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    color: '#2d3748',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d3748';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f7fafc';
                    e.currentTarget.style.color = '#2d3748';
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <span style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '0.25rem', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
            {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
              <span style={{ fontSize: '0.75rem', color: '#2d3748', marginTop: '0.25rem', display: 'block' }}>
                ✓ Las contraseñas coinciden
              </span>
            )}
          </div>

          {/* Botón de registro */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#a0aec0' : '#2d3748',
              color: '#ffffff',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
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
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#718096', fontSize: '0.875rem' }}>
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#2d3748', 
                textDecoration: 'none', 
                fontWeight: '500' 
              }}
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;