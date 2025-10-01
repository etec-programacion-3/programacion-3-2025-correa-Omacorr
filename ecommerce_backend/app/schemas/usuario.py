from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime

# Schemas para registro
class UsuarioCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('El username debe tener al menos 3 caracteres')
        if not v.isalnum():
            raise ValueError('El username solo puede contener letras y números')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('La contraseña debe tener al menos 6 caracteres')
        return v

# Schemas para login
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

# Schema para respuesta de autenticación
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos

class TokenData(BaseModel):
    username: Optional[str] = None

# Schema para perfil público (sin información sensible)
class UsuarioPublico(BaseModel):
    id: int
    username: str
    nombre: str
    apellido: str
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Schema para perfil completo (para el usuario autenticado)
class UsuarioCompleto(BaseModel):
    id: int
    email: str
    username: str
    nombre: str
    apellido: str
    telefono: Optional[str]
    direccion: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Schema para actualizar usuario
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

