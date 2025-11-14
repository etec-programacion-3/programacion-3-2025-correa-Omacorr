from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[Usuario]:
    """Obtiene un usuario por su email"""
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[Usuario]:
    """Obtiene un usuario por su username"""
    return db.query(Usuario).filter(Usuario.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[Usuario]:
    """Obtiene un usuario por su ID"""
    return db.query(Usuario).filter(Usuario.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Obtiene una lista de usuarios con paginación"""
    return db.query(Usuario).filter(Usuario.is_active == True).offset(skip).limit(limit).all()

def create_user(db: Session, user: UsuarioCreate) -> Usuario:
    """
    Crea un nuevo usuario
    
    Args:
        db: Sesión de la base de datos
        user: Datos del usuario a crear
    
    Returns:
        Usuario creado
    
    Raises:
        ValueError: Si el email o username ya existen
    """
    # Verificar que no exista el email
    if get_user_by_email(db, email=user.email):
        raise ValueError("El email ya está registrado")
    
    # Verificar que no exista el username
    if get_user_by_username(db, username=user.username):
        raise ValueError("El username ya está en uso")
    
    # Crear el hash de la contraseña
    hashed_password = get_password_hash(user.password)
    
    # Crear el objeto usuario
    db_user = Usuario(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        nombre=user.nombre,
        apellido=user.apellido,
        telefono=user.telefono,
        direccion=user.direccion,
        ciudad=user.ciudad,
        provincia=user.provincia,
        codigo_postal=user.codigo_postal
    )
    
    # Guardar en la base de datos
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[Usuario]:
    """
    Autentica un usuario verificando email y contraseña
    
    Args:
        db: Sesión de la base de datos
        email: Email del usuario
        password: Contraseña en texto plano
    
    Returns:
        Usuario si las credenciales son correctas, None si no
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def update_user(db: Session, user_id: int, user_update: UsuarioUpdate) -> Optional[Usuario]:
    """
    Actualiza los datos de un usuario
    
    Args:
        db: Sesión de la base de datos
        user_id: ID del usuario a actualizar
        user_update: Datos a actualizar
    
    Returns:
        Usuario actualizado o None si no existe
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    # Actualizar solo los campos que se proporcionaron
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def deactivate_user(db: Session, user_id: int) -> Optional[Usuario]:
    """
    Desactiva un usuario (soft delete)
    
    Args:
        db: Sesión de la base de datos  
        user_id: ID del usuario a desactivar
    
    Returns:
        Usuario desactivado o None si no existe
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_public_info(db: Session, username: str) -> Optional[Usuario]:
    """
    Obtiene la información pública de un usuario por username
    Incluye solo datos no sensibles
    """
    return db.query(Usuario).filter(
        and_(Usuario.username == username, Usuario.is_active == True)
    ).first()