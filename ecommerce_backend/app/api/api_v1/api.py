from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, usuarios, productos, conversaciones

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["autenticación"])
api_router.include_router(usuarios.router, prefix="/users", tags=["usuarios"])
api_router.include_router(productos.router, prefix="/products", tags=["productos"])
api_router.include_router(conversaciones.router, prefix="/conversations", tags=["mensajería"])
