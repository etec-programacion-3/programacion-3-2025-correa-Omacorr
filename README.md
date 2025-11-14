# programacion-3-2025-correa-Omacorr
programacion-3-2025-correa-Omacorr created by GitHub Classroom
# 🛒 E-Commerce Platform

**Plataforma de comercio electrónico full-stack desarrollada con FastAPI y React**

Una aplicación web moderna que permite a los usuarios comprar y vender productos de manera fácil y segura, con sistema de autenticación, gestión de productos, carrito de compras y proceso de checkout completo.

## 🚀 Características Principales

- **Autenticación completa** con JWT
- **Gestión de productos** con categorías y búsqueda
- **Carrito de compras** persistente
- **Sistema de checkout** con validaciones
- **Perfiles de usuario** editables
- **Sistema de mensajería** entre usuarios
- **Calificaciones y reviews** de productos
- **Panel de administración** de productos propios
- **Filtros avanzados** por categoría y búsqueda

## 🏗️ Arquitectura

### Backend
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para manejo de base de datos
- **SQLite** - Base de datos relacional
- **Pydantic** - Validación de datos
- **JWT** - Autenticación y autorización
- **CORS** - Configurado para desarrollo

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **React Router** - Navegación SPA
- **Lucide React** - Iconografía moderna
- **CSS Modules** - Estilos modulares

## 📋 Prerrequisitos

- **Python 3.8+**
- **Node.js 16+** y **npm**
- **Git**

## ⚙️ Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/ecommerce-platform.git
cd ecommerce-platform
```

### 2. Configurar el Backend

```bash
# Navegar al directorio del backend
cd ecommerce_backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear base de datos y ejecutar migraciones
python -c "from app.database import create_tables; create_tables()"
```

### 3. Configurar el Frontend

```bash
# Navegar al directorio del frontend (en nueva terminal)
cd ecommerce_frontend

# Instalar dependencias
npm install
```

## 🚦 Ejecución

### Backend (Puerto 8000)

```bash
cd ecommerce_backend
# Activar entorno virtual si no está activado
source venv/bin/activate  # macOS/Linux
# o
venv\Scripts\activate    # Windows

# Ejecutar servidor de desarrollo
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**El backend estará disponible en:** `http://127.0.0.1:8000`
**Documentación de la API:** `http://127.0.0.1:8000/docs`

### Frontend (Puerto 5173/5174)

```bash
cd ecommerce_frontend

# Ejecutar servidor de desarrollo
npm run dev
```

**El frontend estará disponible en:** `http://localhost:5173` o `http://localhost:5174`

## 🔧 Variables de Entorno

### Backend (`ecommerce_backend/.env`)

```env
# Base de datos
DATABASE_URL=sqlite:///./ecommerce.db

# JWT
SECRET_KEY=tu-clave-secreta-muy-segura-aqui-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:5173

# Configuración del servidor
HOST=127.0.0.1
PORT=8000
DEBUG=True
```

### Frontend (`ecommerce_frontend/.env`)

```env
# API Backend
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1

# Configuración de desarrollo
VITE_NODE_ENV=development
```

## 📖 API Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `GET /api/v1/usuarios/me` - Perfil del usuario actual

### Productos
- `GET /api/v1/products/` - Listar productos con filtros
- `POST /api/v1/products/` - Crear producto
- `GET /api/v1/products/{id}` - Obtener producto específico
- `PUT /api/v1/products/{id}` - Actualizar producto
- `DELETE /api/v1/products/{id}` - Eliminar producto

### Pedidos
- `POST /api/v1/orders/` - Crear pedido
- `GET /api/v1/orders/` - Obtener pedidos del usuario

## 🧪 Pruebas de la API

Consulta el archivo `requests.http` en la raíz del proyecto para ejemplos de todas las llamadas a la API.

## 🗂️ Estructura del Proyecto

```
ecommerce-platform/
├── ecommerce_backend/          # Backend FastAPI
│   ├── app/
│   │   ├── api/               # Endpoints de la API
│   │   ├── models/            # Modelos de SQLAlchemy
│   │   ├── schemas/           # Esquemas de Pydantic
│   │   ├── core/             # Configuración y seguridad
│   │   └── main.py           # Punto de entrada
│   ├── requirements.txt       # Dependencias Python
│   └── .env                  # Variables de entorno
├── ecommerce_frontend/        # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── contexts/        # Context de React (Auth, Cart)
│   │   ├── services/        # API client
│   │   └── constants.ts     # Constantes globales
│   ├── package.json         # Dependencias Node.js
│   └── .env                # Variables de entorno
├── requests.http            # Archivo de pruebas de API
└── README.md               # Este archivo
```

## 👥 Funcionalidades por Rol

### Usuario General
- ✅ Registro e inicio de sesión
- ✅ Navegación y búsqueda de productos
- ✅ Filtros por categoría
- ✅ Carrito de compras
- ✅ Proceso de checkout completo
- ✅ Historial de pedidos

### Vendedor
- ✅ Publicar productos
- ✅ Gestionar inventario propio
- ✅ Editar/eliminar productos
- ✅ Recibir mensajes de compradores

### Usuario Autenticado
- ✅ Perfil editable
- ✅ Direcciones de envío
- ✅ Sistema de mensajería
- ✅ Calificar productos

## 🛠️ Tecnologías Utilizadas

### Backend
- FastAPI 0.104+
- SQLAlchemy 2.0+
- Pydantic 2.0+
- python-jose[cryptography]
- python-multipart
- uvicorn

### Frontend
- React 18
- TypeScript
- React Router DOM
- Lucide React
- Vite

## 🔒 Seguridad

- **Autenticación JWT** con tokens seguros
- **Validación de datos** con Pydantic
- **Protección de rutas** en frontend y backend
- **CORS configurado** correctamente
- **Variables de entorno** para datos sensibles

## 🚀 Próximas Funcionalidades

- [ ] Sistema de upload de imágenes
- [ ] Notificaciones en tiempo real
- [ ] Sistema de pagos integrado
- [ ] Panel de administración avanzado
- [ ] Métricas y analytics
- [ ] Sistema de cupones y descuentos

## 🤝 Contribuciones

Este proyecto fue desarrollado como parte del curso de Programación 3. 

## 📄 Licencia

Este proyecto es de uso académico y educativo.

---

**Desarrollado con ❤️ por Omar para Programación 3 - 2025**
