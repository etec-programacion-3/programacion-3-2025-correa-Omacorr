// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

// Importar páginas (lazy loading para mejor performance)
import { lazy, Suspense } from 'react';

// Componente de loading
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="spinner w-12 h-12 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando página...</p>
    </div>
  </div>
);

// Lazy loading de páginas
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CreateProductPage = lazy(() => import('../pages/CreateProductPage'));
const MyProductsPage = lazy(() => import('../pages/MyProductsPage'));
const ConversationsPage = lazy(() => import('../pages/ConversationsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const MyReviewsPage = lazy(() => import('../pages/MyReviewsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Wrapper para lazy loading con Suspense
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Configuración del router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <LazyWrapper>
        <NotFoundPage />
      </LazyWrapper>
    ),
    children: [
      {
        index: true, // Esta será la ruta '/'
        element: (
          <LazyWrapper>
            <HomePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <LazyWrapper>
            <LoginPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <LazyWrapper>
            <RegisterPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'products',
        children: [
          {
            index: true, // /products
            element: (
              <LazyWrapper>
                <ProductsPage />
              </LazyWrapper>
            ),
          },
          {
            path: 'create', // /products/create
            element: (
              <LazyWrapper>
                <CreateProductPage />
              </LazyWrapper>
            ),
          },
          {
            path: ':id', // /products/:id
            element: (
              <LazyWrapper>
                <ProductDetailPage />
              </LazyWrapper>
            ),
          },
        ],
      },
      {
        path: 'my-products',
        element: (
          <LazyWrapper>
            <MyProductsPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'conversations',
        element: (
          <LazyWrapper>
            <ConversationsPage />
          </LazyWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyWrapper>
            <ProfilePage />
          </LazyWrapper>
        ),
      },
      {
        path: 'my-reviews',
        element: (
          <LazyWrapper>
            <MyReviewsPage />
          </LazyWrapper>
        ),
      },
      {
        path: '*',
        element: (
          <LazyWrapper>
            <NotFoundPage />
          </LazyWrapper>
        ),
      },
    ],
  },
]);

// HOC para proteger rutas que requieren autenticación
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// HOC para rutas que solo pueden acceder usuarios no autenticados
export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Hook personalizado para navegación programática
import { useNavigate } from 'react-router-dom';

export const useAppNavigate = () => {
  const navigate = useNavigate();

  return {
    goHome: () => navigate('/'),
    goToProducts: () => navigate('/products'),
    goToProduct: (id: number) => navigate(`/products/${id}`),
    goToLogin: () => navigate('/login'),
    goToRegister: () => navigate('/register'),
    goToCreateProduct: () => navigate('/products/create'),
    goToMyProducts: () => navigate('/my-products'),
    goToConversations: () => navigate('/conversations'),
    goToProfile: () => navigate('/profile'),
    goToMyReviews: () => navigate('/my-reviews'),
    goBack: () => navigate(-1),
  };
};

// Tipos para TypeScript
export type AppRoute = 
  | '/'
  | '/login'
  | '/register'
  | '/products'
  | '/products/create'
  | `/products/${number}`
  | '/my-products'
  | '/conversations'
  | '/profile'
  | '/my-reviews';

// Configuración de rutas para fácil acceso
export const routes = {
  home: '/',
  login: '/login',
  register: '/register',
  products: '/products',
  createProduct: '/products/create',
  productDetail: (id: number) => `/products/${id}`,
  myProducts: '/my-products',
  conversations: '/conversations',
  profile: '/profile',
  myReviews: '/my-reviews',
} as const;

export default router;
