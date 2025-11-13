from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CalificacionCreate(BaseModel):
    puntuacion: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comentario: Optional[str] = Field(None, max_length=500, description="Comentario opcional")
    

class CalificacionResponse(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    puntuacion: int
    comentario: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CalificacionConUsuario(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    usuario_username: str
    usuario_nombre: str
    puntuacion: int
    comentario: Optional[str]
    created_at: datetime

class CalificacionUpdate(BaseModel):
    puntuacion: Optional[int] = Field(None, ge=1, le=5)
    comentario: Optional[str] = Field(None, max_length=500)