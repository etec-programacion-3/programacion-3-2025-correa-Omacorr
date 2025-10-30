const RegisterPage = () => {
  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Crear Cuenta</h2>
        <form>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre Completo</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="Tu nombre completo"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Usuario</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="tu_usuario"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="tu@email.com"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contraseña</label>
            <input 
              type="password" 
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Crear Cuenta
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#2563eb' }}>Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
