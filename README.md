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
```

**⚠️ IMPORTANTE: Configurar variables de entorno ANTES de crear la base de datos**

1. Crea el archivo `.env` copiando el ejemplo:
   ```bash
   cp .env.example .env
   ```

2. **GENERA un SECRET_KEY seguro**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. Edita el archivo `.env` y reemplaza `your-secret-key-here` con la clave generada

4. Verifica que el archivo `.env` tenga este contenido:
   ```env
   DATABASE_URL=sqlite:///./ecommerce.db
   SECRET_KEY=tu-clave-generada-aqui
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   PROJECT_NAME=E-commerce API
   VERSION=1.0.0
   ```

5. **Ahora sí, crea las tablas**:
   ```bash
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

**El frontend estará disponible en:** `http://localhost:5174`

## 🔧 Variables de Entorno

### Backend (`ecommerce_backend/.env`)

```env
# Base de datos
DATABASE_URL=sqlite:///./ecommerce.db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:5173

# Configuración del servidor
HOST=127.0.0.1
PORT=8000
DEBUG=True
```

**⚠️ IMPORTANTE: Cómo generar un SECRET_KEY seguro**

Para generar una clave secreta segura, ejecuta uno de estos comandos en tu terminal:

```bash
# Opción 1: Usando Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Opción 2: Usando OpenSSL
openssl rand -hex 32
```

Copia el resultado generado y reemplaza `your-secret-key-here` en tu archivo `.env`.

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

### Usando el archivo `requests-testing.http`

El proyecto incluye un archivo `ecommerce_backend/requests-testing.http` con todos los endpoints documentados.

**Pasos para probar la API:**

1. **Asegúrate de que el backend esté corriendo** en `http://127.0.0.1:8000`

2. **Abre** `ecommerce_backend/requests-testing.http` en VS Code (con extensión REST Client)

3. **Sigue el flujo de autenticación:**
   - Ejecuta el **REGISTRO** (sección 1.1) para crear un usuario
   - Ejecuta el **LOGIN** (sección 1.2.1 es más simple) para obtener un token
   - **Copia** el valor de `access_token` de la respuesta
   - **Edita la línea 7** del archivo: `@token = Bearer tu_token_copiado_aqui`
   - **Guarda** el archivo (Ctrl+S)

4. **Ahora puedes ejecutar** todos los endpoints protegidos

**Notas importantes:**
- Los tokens expiran en 30 minutos
- El endpoint de login requiere el **EMAIL** (no el username) en el campo `username` para OAuth2
- Usa `/auth/login-simple` si prefieres enviar JSON en lugar de form-data

### Documentación interactiva

También puedes usar Swagger UI:
- Visita: `http://127.0.0.1:8000/docs`
- Click en "Authorize" y pega tu token con el formato: `Bearer tu_token_aqui`

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

## 🐛 Troubleshooting (Solución de Problemas)

### Error: "No se pudieron validar las credenciales" (401)

**Causas comunes:**
1. No copiaste el token correctamente en el archivo `requests-testing.http`
2. El token expiró (duran 30 minutos)
3. No guardaste el archivo después de pegar el token
4. El servidor no se reinició después de crear el archivo `.env`

**Solución:**
1. Ejecuta el login nuevamente para obtener un token fresco
2. Copia el `access_token` completo (sin espacios extra)
3. Edita línea 7: `@token = Bearer tu_token_aqui`
4. Guarda el archivo (Ctrl+S)
5. Prueba nuevamente

### Error: "Usuario no encontrado" (404)

**Causas:**
- No existe un usuario con ese username/email en la base de datos
- La base de datos está vacía

**Solución:**
1. Ejecuta el registro (sección 1.1 del archivo requests)
2. Verifica que la base de datos se creó: `ls ecommerce_backend/ecommerce.db`

### Error al crear tablas: "Extra inputs are not permitted"

**Causa:** El archivo `.env` tiene campos que no están en la configuración

**Solución:**
Asegúrate de que tu `.env` solo tenga estos campos:
```env
DATABASE_URL=sqlite:///./ecommerce.db
SECRET_KEY=tu-clave-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PROJECT_NAME=E-commerce API
VERSION=1.0.0
```

### El login no funciona (401)

**Causa:** El endpoint `/auth/login` requiere el **EMAIL** en el campo `username` (no el username)

**Solución:**
Usa el EMAIL al hacer login:
```
username=omar@test.com&password=test123456
```

O usa el endpoint alternativo `/auth/login-simple` con JSON

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