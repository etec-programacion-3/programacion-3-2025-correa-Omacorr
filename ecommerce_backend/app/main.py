from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from .core.config import settings
from .api.api_v1.api import api_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API REST para E-commerce con sistema de autenticación JWT"
)

# Middleware para capturar excepciones
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print("=" * 80)
        print("ERROR CAPTURADO:")
        print(traceback.format_exc())
        print("=" * 80)
        return JSONResponse(
            status_code=500,
            content={"detail": str(e), "type": type(e).__name__}
        )

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": f"Bienvenido a {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "register": "POST /api/v1/auth/register",
            "login": "POST /api/v1/auth/login", 
            "user_profile": "GET /api/v1/users/{username}",
            "my_profile": "GET /api/v1/users/me/profile"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}