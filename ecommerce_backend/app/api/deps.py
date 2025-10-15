from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_token
from app.crud.usuario import get_user_by_username
from app.models.usuario import Usuario

# Configurar el esquema de seguridad Bearer
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependencia para obtener el usuario actual desde el token JWT
    
    Esta función:
    1. Extrae el token del header Authorization
    2. Verifica que el token sea válido
    3. Obtiene el usuario de la base de datos
    4. Retorna el usuario o lanza una excepción
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verificar el token y obtener el username
    username = verify_token(credentials.credentials, credentials_exception)
    
    # Buscar el usuario en la base de datos
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
        
    return user

def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """
    Dependencia para obtener el usuario actual activo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Usuario inactivo"
        )
    return current_user

# Dependencia opcional para rutas que pueden o no requerir autenticación
def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Usuario]:
    """
    Dependencia opcional que retorna el usuario si está autenticado, None si no
    """
    if not credentials:
        return None
        
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None