import { Link } from 'react-router-dom';
import { ShoppingBag, Star, MessageCircle } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="animate-fade-in">
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
    </div>
  );
};

export default HomePage;
