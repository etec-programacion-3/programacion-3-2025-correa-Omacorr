import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductsPage from '../pages/ProductsPage';
import ConversationsPage from '../pages/ConversationsPage';
import ConversationDetailPage from '../pages/ConversationDetailPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage.tsx';
import CreateProductPage from '../pages/CreateProductPage';
import MyProductsPage from '../pages/MyProductPage.tsx';
import EditProductPage from '../pages/EditProductPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'conversations',
        element: <ConversationsPage />,
      },
      {
        path: 'conversations/:id',
        element: <ConversationDetailPage />, // ← SOLO ESTA LÍNEA
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'products/create',
        element: <CreateProductPage />,
      },
      {
        path: 'my-products',
        element: <MyProductsPage />,
      },
      {
        path: "products/:id/edit",
        element: <EditProductPage />,
      },
    ],
  },
]);

export default router;