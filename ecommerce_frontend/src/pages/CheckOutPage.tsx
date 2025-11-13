import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface ShippingData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  additional_info?: string;
}

interface PaymentData {
  card_number: string;
  card_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ⭐ INICIALIZAR DATOS CON useEffect para asegurar carga correcta
  const [shippingData, setShippingData] = useState<ShippingData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Argentina',
    additional_info: ''
  });

  // ⭐ CARGAR DATOS DEL USUARIO CUANDO CAMBIE
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario cargado:', user); // Debug
      setShippingData({
        full_name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.full_name || '',
        email: user.email || '',
        phone: user.telefono || '',
        address: user.direccion || '',
        city: user.ciudad || '',
        state: user.provincia || '',
        postal_code: user.codigo_postal || '',
        country: 'Argentina',
        additional_info: ''
      });
    }
  }, [user]); // ← Se ejecuta cada vez que user cambia

  const [paymentData, setPaymentData] = useState<PaymentData>({
    card_number: '',
    card_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: ''
  });

  // Validaciones específicas mejoradas
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 16) return paymentData.card_number;
    return numbers.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatPostalCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 8);
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
      if (cleaned.length > 1 && !cleaned.startsWith('+54')) {
        cleaned = '+54';
      }
      return cleaned.slice(0, 15);
    } else {
      return cleaned.slice(0, 11);
    }
  };

  // Redirigir si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega productos antes de continuar con el checkout</p>
          <Link to="/products" className="btn-primary">
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingData.full_name || !shippingData.address || !shippingData.city || !shippingData.phone) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    
    const phoneNumbers = shippingData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 8) {
      setError('El teléfono debe tener al menos 8 dígitos');
      return;
    }
    
    if (shippingData.postal_code && shippingData.postal_code.length < 4) {
      setError('El código postal debe tener al menos 4 dígitos');
      return;
    }
    
    if (shippingData.full_name.trim().split(' ').length < 2) {
      setError('Ingresa tu nombre completo (nombre y apellido)');
      return;
    }
    
    setError(null);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentData.card_number || !paymentData.card_name || !paymentData.cvv || !paymentData.expiry_month || !paymentData.expiry_year) {
      setError('Por favor completa todos los campos de pago');
      return;
    }
    
    const cardNumbers = paymentData.card_number.replace(/\s/g, '');
    if (cardNumbers.length !== 16) {
      setError('El número de tarjeta debe tener exactamente 16 dígitos');
      return;
    }
    
    if (paymentData.cvv.length < 3) {
      setError('El CVV debe tener al menos 3 dígitos');
      return;
    }
    
    if (paymentData.card_name.trim().split(' ').length < 2) {
      setError('Ingresa el nombre completo como aparece en la tarjeta');
      return;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(paymentData.expiry_year);
    const expMonth = parseInt(paymentData.expiry_month);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setError('La fecha de vencimiento no puede estar en el pasado');
      return;
    }
    
    setError(null);
    setCurrentStep('review');
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fullAddress = `${shippingData.address}, ${shippingData.city}, ${shippingData.state} ${shippingData.postal_code}, ${shippingData.country}`;
      if (shippingData.additional_info) {
        fullAddress += ` - ${shippingData.additional_info}`;
      }

      console.log('=== DATOS A ENVIAR ===');
      console.log('Items del carrito:', items);
      console.log('======================');

      const response = await api.orders.create(items);
      
      clearCart();
      
      alert(`¡Pedido creado exitosamente! 🎉\nID: ${response.pedido_id}\nSe enviará a: ${shippingData.full_name}\n${fullAddress}`);
      navigate('/profile?tab=orders');
      
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = 'Error al procesar el pedido';
      
      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.detail;
        if (Array.isArray(validationErrors)) {
          errorMessage = `Errores de validación: ${validationErrors.map(error => error.msg).join(', ')}`;
        } else if (typeof validationErrors === 'string') {
          errorMessage = validationErrors;
        } else {
          errorMessage = 'Datos de pedido inválidos';
        }
      } else {
        errorMessage = err.response?.data?.detail || err.message || 'Error al procesar el pedido';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = totalPrice > 50000 ? 0 : 5000;
  const finalTotal = totalPrice + shippingCost;

  // Meses para el selector bonito
  const months = [
    { value: '01', label: '01 - Enero' },
    { value: '02', label: '02 - Febrero' },
    { value: '03', label: '03 - Marzo' },
    { value: '04', label: '04 - Abril' },
    { value: '05', label: '05 - Mayo' },
    { value: '06', label: '06 - Junio' },
    { value: '07', label: '07 - Julio' },
    { value: '08', label: '08 - Agosto' },
    { value: '09', label: '09 - Septiembre' },
    { value: '10', label: '10 - Octubre' },
    { value: '11', label: '11 - Noviembre' },
    { value: '12', label: '12 - Diciembre' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 15}, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="container-custom py-8">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: currentStep === 'shipping' ? '#2563eb' : '#10b981',
              fontWeight: '500'
            }}>
              <span style={{ 
                backgroundColor: currentStep === 'shipping' ? '#2563eb' : '#10b981',
                color: 'white',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                fontSize: '0.875rem'
              }}>1</span>
              Envío
            </div>
            
            <div style={{ color: '#d1d5db' }}>→</div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: currentStep === 'payment' ? '#2563eb' : currentStep === 'review' ? '#10b981' : '#9ca3af',
              fontWeight: '500'
            }}>
              <span style={{ 
                backgroundColor: currentStep === 'payment' ? '#2563eb' : currentStep === 'review' ? '#10b981' : '#d1d5db',
                color: 'white',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                fontSize: '0.875rem'
              }}>2</span>
              Pago
            </div>
            
            <div style={{ color: '#d1d5db' }}>→</div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: currentStep === 'review' ? '#2563eb' : '#9ca3af',
              fontWeight: '500'
            }}>
              <span style={{ 
                backgroundColor: currentStep === 'review' ? '#2563eb' : '#d1d5db',
                color: 'white',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.5rem',
                fontSize: '0.875rem'
              }}>3</span>
              Confirmar
            </div>
          </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div className="card">
            {currentStep === 'shipping' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📦 Información de Envío</h2>
                
                {/* Botón para recargar datos del perfil */}
                <div style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        setShippingData({
                          full_name: user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.full_name || '',
                          email: user.email || '',
                          phone: user.telefono || '',
                          address: user.direccion || '',
                          city: user.ciudad || '',
                          state: user.provincia || '',
                          postal_code: user.codigo_postal || '',
                          country: 'Argentina',
                          additional_info: ''
                        });
                      }
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    🔄 Cargar datos del perfil
                  </button>
                </div>
                
                <form onSubmit={handleShippingSubmit}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Información personal */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '1rem' 
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={shippingData.full_name}
                          onChange={(e) => setShippingData({...shippingData, full_name: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Teléfono * 
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                            (mínimo 8 dígitos)
                          </span>
                        </label>
                        <input
                          type="tel"
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({...shippingData, phone: formatPhoneNumber(e.target.value)})}
                          required
                          placeholder="11 1234-5678 o +54 9 11 1234-5678"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Dirección *
                      </label>
                      <input
                        type="text"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                        required
                        placeholder="Calle, número y piso/departamento"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem'
                        }}
                      />
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 100px', 
                      gap: '1rem' 
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Provincia
                        </label>
                        <input
                          type="text"
                          value={shippingData.state}
                          onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Código Postal
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                            (mínimo 4 dígitos)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={shippingData.postal_code}
                          onChange={(e) => setShippingData({...shippingData, postal_code: formatPostalCode(e.target.value)})}
                          placeholder="1234 o 1234567"
                          maxLength={8}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Información adicional (opcional)
                      </label>
                      <textarea
                        value={shippingData.additional_info}
                        onChange={(e) => setShippingData({...shippingData, additional_info: e.target.value})}
                        placeholder="Referencias para la entrega..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                      Continuar al Pago →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 'payment' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">💳 Información de Pago</h2>
                <p style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '2rem',
                  fontSize: '0.875rem'
                }}>
                  ⚠️ Esta es una simulación. No ingreses datos reales de tarjetas.
                </p>
                
                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Número de Tarjeta *
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                          (exactamente 16 dígitos)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={paymentData.card_number}
                        onChange={(e) => setPaymentData({...paymentData, card_number: formatCardNumber(e.target.value)})}
                        placeholder="1234 5678 9012 3456"
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '1rem',
                          letterSpacing: '0.05em'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Nombre en la Tarjeta *
                      </label>
                      <input
                        type="text"
                        value={paymentData.card_name}
                        onChange={(e) => setPaymentData({...paymentData, card_name: e.target.value.toUpperCase()})}
                        required
                        placeholder="COMO APARECE EN LA TARJETA"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          textTransform: 'uppercase'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Mes de Vencimiento *
                        </label>
                        <select
                          value={paymentData.expiry_month}
                          onChange={(e) => setPaymentData({...paymentData, expiry_month: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            backgroundColor: '#ffffff',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="">Seleccionar mes</option>
                          {months.map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Año de Vencimiento *
                        </label>
                        <select
                          value={paymentData.expiry_year}
                          onChange={(e) => setPaymentData({...paymentData, expiry_year: e.target.value})}
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            backgroundColor: '#ffffff',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="">Año</option>
                          {years.map(year => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: formatCVV(e.target.value)})}
                          placeholder="123"
                          required
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            textAlign: 'center',
                            letterSpacing: '0.1em'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('shipping')}
                        className="btn-outline"
                        style={{ flex: 1 }}
                      >
                        ← Volver
                      </button>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                        Revisar Pedido →
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 'review' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">📋 Confirmar Pedido</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="text-lg font-semibold mb-3">📦 Datos de Envío</h3>
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <p><strong>{shippingData.full_name}</strong></p>
                    <p>{shippingData.phone}</p>
                    <p>{shippingData.address}</p>
                    <p>{shippingData.city}, {shippingData.state} {shippingData.postal_code}</p>
                    {shippingData.additional_info && (
                      <p style={{ fontStyle: 'italic' }}>Nota: {shippingData.additional_info}</p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="text-lg font-semibold mb-3">💳 Método de Pago</h3>
                  <div style={{ 
                    backgroundColor: '#f9fafb', 
                    padding: '1rem', 
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <p>Tarjeta terminada en ****{paymentData.card_number.replace(/\s/g, '').slice(-4)}</p>
                    <p>{paymentData.card_name}</p>
                    <p>Vence: {paymentData.expiry_month}/{paymentData.expiry_year}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="btn-outline"
                    style={{ flex: 1 }}
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="btn-primary"
                    style={{ 
                      flex: 2,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Procesando...' : '🎉 Confirmar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ flex: 1 }}>
                    <p className="font-medium" style={{ fontSize: '0.875rem' }}>{item.nombre}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <p className="font-bold">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal ({totalItems} productos)</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Envío</span>
                <span style={{ color: shippingCost === 0 ? '#10b981' : 'inherit' }}>
                  {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toLocaleString()}`}
                </span>
              </div>
              
              {shippingCost === 0 && (
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#10b981', 
                  marginBottom: '1rem',
                  fontWeight: '500'
                }}>
                  🎉 ¡Envío gratis por compras mayores a $50,000!
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                paddingTop: '0.5rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span>Total</span>
                <span>${finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;