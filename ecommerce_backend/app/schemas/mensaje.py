from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

# Schema para crear una conversación
class ConversacionCreate(BaseModel):
    usuario2_id: int  # ID del otro usuario con quien quiero conversar
    
    @validator('usuario2_id')
    def validate_usuario2_id(cls, v):
        if v <= 0:
            raise ValueError('El ID del usuario debe ser mayor a 0')
        return v

# Schema para respuesta de conversación
class ConversacionResponse(BaseModel):
    id: int
    usuario1_id: int
    usuario2_id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Schema para conversación con información del otro usuario
class ConversacionConUsuario(BaseModel):
    id: int
    otro_usuario_id: int
    otro_usuario_username: str
    otro_usuario_nombre: str
    ultimo_mensaje: Optional[str] = None
    ultimo_mensaje_fecha: Optional[datetime] = None
    mensajes_no_leidos: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schema para crear un mensaje
class MensajeCreate(BaseModel):
    contenido: str
    
    @validator('contenido')
    def validate_contenido(cls, v):
        v = v.strip()
        if len(v) == 0:
            raise ValueError('El mensaje no puede estar vacío')
        if len(v) > 5000:
            raise ValueError('El mensaje no puede tener más de 5000 caracteres')
        return v

# Schema para respuesta de mensaje
class MensajeResponse(BaseModel):
    id: int
    conversacion_id: int
    remitente_id: int
    contenido: str
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True

# Schema para mensaje con información del remitente
class MensajeConRemitente(BaseModel):
    id: int
    conversacion_id: int
    remitente_id: int
    remitente_username: str
    remitente_nombre: str
    contenido: str
    created_at: datetime
    is_read: bool
    
    class Config:
        from_attributes = True

# Schema para marcar mensajes como leídos
class MarcarMensajesLeidos(BaseModel):
    mensaje_ids: List[int]