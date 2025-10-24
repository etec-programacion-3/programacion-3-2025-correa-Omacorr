import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Users, MessageCircle } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tu Marketplace de Confianza
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Compra y vende productos de manera fácil y segura
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-lg bg-white text-primary-600 hover:bg-gray-100">
                Explorar Productos
              </Link>
              <Link to="/register" className="btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Comenzar a Vender
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-lg text-gray-600">
              Conectamos compradores y vendedores con las mejores herramientas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fácil de Usar</h3>
              <p className="text-gray-600">
                Interfaz intuitiva para comprar y vender productos sin complicaciones
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sistema de Reseñas</h3>
              <p className="text-gray-600">
                Califica productos y vendedores para ayudar a otros compradores
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comunicación Directa</h3>
              <p className="text-gray-600">
                Chatea directamente con vendedores para resolver dudas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Únete a nuestra comunidad de compradores y vendedores
          </p>
          <Link to="/register" className="btn-primary btn-lg">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

