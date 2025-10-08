from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, usuarios

api_router = APIRouter()

# Incluir routers de autenticación
api_router.include_router(
    auth.router, 
    prefix="/auth", 
    tags=["autenticación"]
)

# Incluir routers de usuarios
api_router.include_router(
    usuarios.router, 
    prefix="/users", 
    tags=["usuarios"]
)

