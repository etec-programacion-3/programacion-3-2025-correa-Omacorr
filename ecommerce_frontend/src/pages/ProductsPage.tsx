const ProductsPage = () => {
  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Productos</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '1rem' 
          }}>
            <div style={{ 
              height: '200px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '6px', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              Imagen del producto
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Producto {item}</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Descripción del producto...</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>$99.99</span>
              <button className="btn btn-primary">Ver Detalles</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
