from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.usuario import UsuarioPublico, UsuarioCompleto, UsuarioUpdate
from app.crud.usuario import get_user_public_info, update_user
from app.api.deps import get_current_active_user
from app.models.usuario import Usuario

router = APIRouter()

@router.get("/{username}", response_model=UsuarioPublico)
def get_user_profile(
    username: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil público de un usuario por su username
    
    - **username**: Nombre de usuario único
    
    Este endpoint es público y retorna información no sensible:
    - ID, username, nombre, apellido
    - Fecha de registro
    - Estado activo
    - NO incluye: email, teléfono, dirección, contraseña
    """
    user = get_user_public_info(db, username=username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario '{username}' no encontrado"
        )
    
    return UsuarioPublico.from_orm(user)

@router.get("/me/profile", response_model=UsuarioCompleto)
def get_my_profile(
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene el perfil completo del usuario autenticado
    
    Requiere autenticación. Retorna toda la información del usuario
    incluyendo datos sensibles como email, teléfono, etc.
    """
    return UsuarioCompleto.from_orm(current_user)

@router.put("/me/profile", response_model=UsuarioCompleto)
def update_my_profile(
    user_update: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del usuario autenticado
    
    - **nombre**: Nuevo nombre (opcional)
    - **apellido**: Nuevo apellido (opcional)
    - **telefono**: Nuevo teléfono (opcional)
    - **direccion**: Nueva dirección (opcional)
    
    Solo se pueden actualizar estos campos. El email, username y contraseña
    requieren endpoints específicos por seguridad.
    """
    updated_user = update_user(db, user_id=current_user.id, user_update=user_update)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return UsuarioCompleto.from_orm(updated_user)