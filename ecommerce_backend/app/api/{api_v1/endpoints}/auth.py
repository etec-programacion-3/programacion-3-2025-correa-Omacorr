from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import RegisterRequest, AuthResponse
from app.schemas.usuario import UsuarioCreate, UsuarioPublico, Token
from app.crud.usuario import create_user, authenticate_user
from app.core.security import create_access_token
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en el sistema
    
    - **email**: Email único del usuario
    - **username**: Nombre de usuario único
    - **password**: Contraseña (será hasheada automáticamente)
    - **nombre**: Nombre real del usuario
    - **apellido**: Apellido del usuario
    - **telefono**: Teléfono (opcional)
    - **direccion**: Dirección (opcional)
    
    Retorna un token de acceso para el usuario recién creado.
    """
    try:
        # Crear el usuario usando el CRUD
        user_create = UsuarioCreate(**user_data.dict())
        new_user = create_user(db=db, user=user_create)
        
        # Generar token de acceso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.username}, 
            expires_delta=access_token_expires
        )
        
        # Preparar respuesta
        user_public = UsuarioPublico.from_orm(new_user)
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_public.dict()
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Inicia sesión y devuelve un token JWT
    
    - **username**: En este caso, usar el email
    - **password**: Contraseña del usuario
    
    Retorna un token de acceso válido por el tiempo configurado.
    """
    # Autenticar usuario (username en OAuth2 es el email en nuestro caso)
    user = authenticate_user(db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # en segundos
    )

@router.post("/login-simple", response_model=AuthResponse)
def login_simple(
    login_data: dict,
    db: Session = Depends(get_db)
):
    """
    Endpoint alternativo de login que acepta JSON directamente
    
    - **email**: Email del usuario
    - **password**: Contraseña del usuario
    """
    email = login_data.get("email")
    password = login_data.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email y contraseña son requeridos"
        )
    
    # Autenticar usuario
    user = authenticate_user(db, email=email, password=password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    # Preparar respuesta
    user_public = UsuarioPublico.from_orm(user)
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_public.dict()
    )