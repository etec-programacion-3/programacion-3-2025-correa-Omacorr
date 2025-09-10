from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
# from .api.api_v1.api import api_router  # Lo comentamos por ahora

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers (lo haremos más adelante)
# app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Bienvenido a {settings.PROJECT_NAME}"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}