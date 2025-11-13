# REEMPLAZAR COMPLETAMENTE tu archivo app/api/api_v1/endpoints/usuarios.py:

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.usuario import UsuarioPublico, UsuarioCompleto, UsuarioUpdate
from app.models.usuario import Usuario
from typing import List

router = APIRouter()

@router.get("/{username}", response_model=UsuarioPublico)
def get_user_by_username(
    username: str,
    db: Session = Depends(deps.get_db)
):
    """
    Obtener usuario por username (endpoint existente)
    """
    usuario = db.query(Usuario).filter(Usuario.username == username).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return usuario

# ⭐ NUEVOS ENDPOINTS PARA FUNCIONALIDAD COMPLETA:

@router.get("/me/profile", response_model=UsuarioCompleto)
def get_current_user_profile_legacy(
    current_user: Usuario = Depends(deps.get_current_user)
):
    """
    Obtener perfil completo del usuario autenticado (compatibilidad con frontend actual)
    """
    return current_user

@router.get("/me", response_model=UsuarioCompleto)
def get_current_user_profile(
    current_user: Usuario = Depends(deps.get_current_user)
):
    """
    Obtener perfil completo del usuario autenticado
    """
    return current_user

@router.put("/me", response_model=UsuarioCompleto)
def update_current_user_profile(
    *,
    db: Session = Depends(deps.get_db),
    user_update: UsuarioUpdate,
    current_user: Usuario = Depends(deps.get_current_user)
):
    """
    Actualizar perfil del usuario autenticado
    """
    try:
        # Obtener solo los campos que se enviaron (exclude_unset=True)
        update_data = user_update.dict(exclude_unset=True)
        
        # Actualizar campos del usuario actual
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
        
        # Guardar cambios
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error actualizando perfil: {str(e)}"
        )