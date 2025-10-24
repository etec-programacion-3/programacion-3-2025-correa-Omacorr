import { Link } from 'react-router-dom';
export const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Página no encontrada</h2>
      <p className="text-gray-600 mb-8">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link to="/" className="btn-primary">
        Volver al Inicio
      </Link>
    </div>
  </div>
);