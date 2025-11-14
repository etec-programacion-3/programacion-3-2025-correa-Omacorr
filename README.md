# 🛒 E-Commerce Platform - Backend API

**API REST completa desarrollada con FastAPI para sistema de e-commerce**

Sistema completo de comercio electrónico con autenticación JWT, gestión de productos, sistema de pedidos, mensajería entre usuarios, calificaciones y más.

## 🚀 Características Principales

- **🔐 Autenticación JWT** - Registro, login y gestión de sesiones
- **👤 Gestión de Usuarios** - Perfiles completos con información personal
- **📦 Sistema de Productos** - CRUD completo con categorías y búsqueda
- **🛒 Gestión de Pedidos** - Carrito, checkout y seguimiento
- **⭐ Sistema de Calificaciones** - Reviews y ratings de productos
- **💬 Mensajería** - Chat entre usuarios con notificaciones
- **🔍 Búsqueda y Filtros** - Por categoría, precio, vendedor
- **📊 Paginación** - Manejo eficiente de grandes cantidades de datos

## 📋 Prerrequisitos

- **Python 3.8+** (recomendado 3.9+)
- **pip** (gestor de paquetes de Python)
- **git** (para clonar el repositorio)

## ⚙️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/ecommerce-platform.git
cd ecommerce-platform/ecommerce_backend
```

### 2. Crear Entorno Virtual

```bash
# Crear entorno virtual
python -m venv venv
# O si tienes problemas:
python3 -m venv venv
```

### 3. Activar Entorno Virtual

**En Linux/macOS:**
```bash
source venv/bin/activate
```

**En Windows:**
```bash
# PowerShell
venv\Scripts\Activate.ps1

# Command Prompt
venv\Scripts\activate.bat
```

### 4. Instalar Dependencias

```bash
pip install -r requirements.txt

# Si da error de permisos en algunas distribuciones:
pip install -r requirements.txt --break-system-packages

# Si pip es muy viejo:
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configurar Variables de Entorno

Crear archivo `.env` en el directorio `ecommerce_backend/`:

```bash
# Copiar ejemplo
cp .env.example .env

# O crear manualmente
touch .env
```

**Contenido del archivo `.env`:**
```env
# Base de datos
DATABASE_URL=sqlite:///./ecommerce.db

# Seguridad JWT
SECRET_KEY=tu-clave-secreta-muy-segura-cambiar-en-produccion-123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuración de la aplicación
PROJECT_NAME=E-commerce API
VERSION=1.0.0
DEBUG=True

# CORS (para desarrollo)
FRONTEND_URL=http://localhost:5173
```

### 6. Inicializar Base de Datos

**Opción 1 (Recomendada):**
```bash
python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(bind=engine)"
```

**Opción 2 (Si la primera falla):**
```bash
# Usar Alembic
alembic upgrade head
```

**Opción 3 (Si todo falla):**
```bash
# Crear manualmente
python -c "
import os
os.chdir('.')
from app.database import engine
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.models.pedido import Pedido, ItemPedido
from app.models.mensaje import Conversacion, Mensaje
from app.models.calificacion import CalificacionProducto
from app.models.base import Base
Base.metadata.create_all(bind=engine)
print('✅ Base de datos creada correctamente')
"
```

**Opción 4 (Última alternativa):**
```bash
# Si nada funciona, iniciar el servidor directamente
# FastAPI creará las tablas automáticamente
uvicorn app.main:app --reload
```

## 🚦 Ejecución

### Iniciar el Servidor de Desarrollo

```bash
# Asegúrate de estar en ecommerce_backend/ y tener el venv activado
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Comandos alternativos si el anterior falla:**
```bash
# Opción 2
python -m uvicorn app.main:app --reload

# Opción 3 (especificando Python completo)
/ruta/completa/a/venv/bin/python -m uvicorn app.main:app --reload

# Opción 4 (solo para desarrollo rápido)
uvicorn app.main:app
```

### Verificar que Funciona

**El servidor estará disponible en:**
- **API:** http://127.0.0.1:8000
- **Documentación interactiva:** http://127.0.0.1:8000/docs
- **Documentación alternativa:** http://127.0.0.1:8000/redoc

**Verificación rápida:**
```bash
curl http://127.0.0.1:8000/health
# Debe retornar: {"status":"ok","version":"1.0.0"}
```

## 📖 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Iniciar sesión

### Usuarios  
- `GET /api/v1/usuarios/me` - Mi perfil completo
- `PUT /api/v1/usuarios/me` - Actualizar mi perfil
- `GET /api/v1/usuarios/{username}` - Perfil público de usuario

### Productos
- `GET /api/v1/products/` - Listar productos (con filtros)
- `POST /api/v1/products/` - Crear producto
- `GET /api/v1/products/{id}` - Obtener producto específico
- `PUT /api/v1/products/{id}` - Actualizar producto
- `DELETE /api/v1/products/{id}` - Eliminar producto

### Pedidos
- `POST /api/v1/orders/` - Crear pedido
- `GET /api/v1/orders/` - Mis pedidos
- `GET /api/v1/orders/{id}` - Pedido específico

### Mensajería
- `POST /api/v1/conversations/` - Crear conversación
- `GET /api/v1/conversations/` - Mis conversaciones  
- `GET /api/v1/conversations/{id}/messages` - Mensajes
- `POST /api/v1/conversations/{id}/messages` - Enviar mensaje

### Calificaciones
- `POST /api/v1/products/{id}/reviews` - Calificar producto
- `GET /api/v1/products/{id}/reviews` - Ver calificaciones

## 🧪 Pruebas de la API

### Archivo de Pruebas Incluido

El proyecto incluye `requests-testing.http` con ejemplos completos de todos los endpoints.

**Para usar con VS Code:**
1. Instalar extensión "REST Client"
2. Abrir `requests-testing.http`
3. Hacer clic en "Send Request" sobre cada endpoint

### Flujo de Prueba Rápido

```bash
# 1. Registrar usuario
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "nombre": "Test",
    "apellido": "User"
  }'

# 2. Hacer login (guarda el token)
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# 3. Crear producto (usar el token del paso anterior)
curl -X POST http://127.0.0.1:8000/api/v1/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombre": "Producto de Prueba",
    "descripcion": "Descripción del producto",
    "precio": 100.00,
    "stock": 5,
    "categoria": "Otros"
  }'
```

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```env
# Base de datos
DATABASE_URL=sqlite:///./ecommerce.db
# Para PostgreSQL:
# DATABASE_URL=postgresql://usuario:password@localhost/ecommerce_db
# Para MySQL:
# DATABASE_URL=mysql://usuario:password@localhost/ecommerce_db

# Seguridad
SECRET_KEY=clave-super-secreta-de-al-menos-32-caracteres-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Aplicación
PROJECT_NAME=E-commerce API
VERSION=1.0.0
DEBUG=True
API_V1_STR=/api/v1

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://localhost:5174"]
FRONTEND_URL=http://localhost:5173

# Logs
LOG_LEVEL=INFO
```

### Uso con Base de Datos Externa

**Para PostgreSQL:**
```bash
# Instalar driver
pip install psycopg2-binary

# Configurar en .env
DATABASE_URL=postgresql://usuario:password@localhost:5432/ecommerce_db
```

**Para MySQL:**
```bash
# Instalar driver  
pip install pymysql

# Configurar en .env
DATABASE_URL=mysql+pymysql://usuario:password@localhost:3306/ecommerce_db
```

## 🗂️ Estructura del Proyecto

```
ecommerce_backend/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py          # Autenticación
│   │       │   ├── usuarios.py      # Gestión usuarios
│   │       │   ├── productos.py     # CRUD productos
│   │       │   ├── conversaciones.py # Mensajería
│   │       │   └── pedidos_router.py # Sistema pedidos
│   │       └── api.py              # Router principal
│   ├── core/
│   │   ├── config.py               # Configuración
│   │   └── security.py             # JWT y seguridad
│   ├── crud/
│   │   ├── usuario.py              # Operaciones BD usuarios
│   │   ├── producto.py             # Operaciones BD productos
│   │   ├── mensaje.py              # Operaciones BD mensajes
│   │   └── calificacion.py         # Operaciones BD calificaciones
│   ├── models/
│   │   ├── base.py                 # Modelo base
│   │   ├── usuario.py              # Modelo Usuario
│   │   ├── producto.py             # Modelo Producto
│   │   ├── pedido.py               # Modelos Pedido/ItemPedido
│   │   ├── mensaje.py              # Modelos Conversacion/Mensaje
│   │   └── calificacion.py         # Modelo CalificacionProducto
│   ├── schemas/
│   │   ├── auth.py                 # Schemas autenticación
│   │   ├── usuario.py              # Schemas usuario
│   │   ├── producto.py             # Schemas producto
│   │   ├── mensaje.py              # Schemas mensajería
│   │   └── calificacion.py         # Schemas calificaciones
│   ├── utils/
│   │   └── notifications.py        # Sistema notificaciones
│   ├── database.py                 # Configuración BD
│   └── main.py                     # Aplicación principal
├── alembic/                        # Migraciones BD
├── tests/                          # Tests automatizados
├── venv/                           # Entorno virtual
├── requirements.txt                # Dependencias Python
├── .env.example                    # Ejemplo variables entorno
├── alembic.ini                     # Configuración migraciones
└── requests-testing.http           # Archivo pruebas API
```

## 🛠️ Dependencias Principales

```txt
fastapi>=0.115.0              # Framework web
uvicorn[standard]>=0.30.0      # Servidor ASGI
sqlalchemy>=2.0.35             # ORM base de datos
alembic>=1.13.0                # Migraciones BD
python-jose[cryptography]      # JWT tokens
passlib==1.7.4                 # Hashing contraseñas
bcrypt==4.0.1                  # Algoritmo hashing
pydantic>=2.10.0               # Validación datos
pydantic-settings>=2.6.0       # Configuración
python-multipart>=0.0.12       # Formularios
pydantic[email]>=2.10.0        # Validación emails
```

## 🔒 Seguridad

### Características de Seguridad Implementadas

- **🔐 Autenticación JWT** con tokens seguros
- **🔑 Hashing BCrypt** para contraseñas  
- **🛡️ Validación Pydantic** en todos los endpoints
- **🚫 Protección CORS** configurada
- **👥 Autorización por roles** (owner de recursos)
- **🔒 Rutas protegidas** que requieren autenticación
- **⏰ Tokens con expiración** configurable

### Variables de Entorno Sensibles

**¡IMPORTANTE!** Cambiar estos valores en producción:

```env
# CAMBIAR OBLIGATORIAMENTE en producción
SECRET_KEY=generar-clave-aleatoria-de-32-caracteres-minimo

# Configurar según ambiente
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=15
```

## 🚀 Despliegue en Producción

### Preparación

```bash
# 1. Instalar dependencias de producción
pip install gunicorn

# 2. Configurar variables de entorno
export DEBUG=False
export SECRET_KEY="clave-super-secreta-produccion"

# 3. Usar base de datos externa
export DATABASE_URL="postgresql://user:pass@db:5432/ecommerce"

# 4. Ejecutar con Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (Opcional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Solución de Problemas

### Problema: "ModuleNotFoundError: No module named 'app'"

**Solución:**
```bash
# Asegúrate de estar en ecommerce_backend/
pwd  # Debe mostrar /ruta/al/proyecto/ecommerce_backend

# Activar entorno virtual
source venv/bin/activate

# Verificar instalación
pip list | grep fastapi
```

### Problema: "Failed to create tables"

**Solución:**
```bash
# Verificar permisos del directorio
ls -la

# Eliminar BD y recrear
rm ecommerce.db

# Recrear con método alternativo
python -c "
from app.database import engine
from app.models.base import Base
from app.models import *
Base.metadata.create_all(bind=engine)
"
```

### Problema: "Port 8000 already in use"

**Solución:**
```bash
# Ver qué proceso usa el puerto
lsof -i :8000

# Matar proceso (reemplazar PID)
kill -9 PID

# O usar otro puerto
uvicorn app.main:app --reload --port 8001
```

### Problema: "CORS error from frontend"

**Solución:**
```env
# Agregar la URL del frontend a .env
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173","http://tu-frontend-url"]
```

### Problema: "SQLAlchemy version warnings"

**Solución:**
```bash
# Actualizar SQLAlchemy
pip install --upgrade sqlalchemy

# Si persiste, reinstalar todo
pip uninstall sqlalchemy
pip install sqlalchemy>=2.0.35
```

## 📚 Documentación API

### Documentación Automática

- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc
- **OpenAPI JSON:** http://127.0.0.1:8000/api/v1/openapi.json

### Archivo de Pruebas

Usar `requests-testing.http` con VS Code + REST Client para probar todos los endpoints de manera interactiva.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es de uso académico y educativo - Programación 3 - 2025

---

## 🆘 Ayuda Rápida

**Si nada funciona, prueba este flujo completo:**

```bash
# 1. Verificar Python
python --version  # Debe ser 3.8+

# 2. Recrear entorno
rm -rf venv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# 4. Recrear base de datos  
rm -f ecommerce.db
python -c "from app.models import Base; from app.database import engine; Base.metadata.create_all(bind=engine)"

# 5. Iniciar servidor
uvicorn app.main:app --reload

# 6. Verificar
curl http://127.0.0.1:8000/health
```

**Si aún tienes problemas, revisa:**
- Que estés en el directorio correcto (`ecommerce_backend/`)
- Que el entorno virtual esté activado (debe aparecer `(venv)` en terminal)
- Que tengas permisos de escritura en el directorio
- Que no haya otro proceso usando el puerto 8000
