from pydantic import BaseModel, validator, Field
from typing import Optional
from datetime import datetime

# Schema para crear una calificación
class CalificacionCreate(BaseModel):
    puntuacion: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comentario: Optional[str] = Field(None, max_length=1000, description="Comentario opcional")
    
    @validator('puntuacion')
    def validate_puntuacion(cls, v):
        if v < 1 or v > 5:
            raise ValueError('La calificación debe estar entre 1 y 5 estrellas')
        return v
    
    @validator('comentario')
    def validate_comentario(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) == 0:
                return None
            if len(v) > 1000:
                raise ValueError('El comentario no puede tener más de 1000 caracteres')
        return v

# Schema para actualizar una calificación
class CalificacionUpdate(BaseModel):
    puntuacion: Optional[int] = Field(None, ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=1000)
    
    @validator('puntuacion')
    def validate_puntuacion(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('La calificación debe estar entre 1 y 5 estrellas')
        return v

# Schema para respuesta de calificación
class CalificacionResponse(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    puntuacion: int
    comentario: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schema para calificación con información del usuario
class CalificacionConUsuario(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    usuario_username: str
    usuario_nombre: str
    puntuacion: int
    comentario: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schema para estadísticas de calificaciones
class CalificacionesStats(BaseModel):
    total_calificaciones: int
    promedio: float
    estrellas_5: int
    estrellas_4: int
    estrellas_3: int
    estrellas_2: int
    estrellas_1: int