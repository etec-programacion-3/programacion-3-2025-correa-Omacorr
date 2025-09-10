from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import Base

class CalificacionProducto(Base):
    __tablename__ = "calificaciones_producto"
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    puntuacion = Column(Integer, nullable=False)  # 1-5 estrellas
    comentario = Column(Text)
    created_at = Column(DateTime, nullable=False)
    
    # Relaciones
    producto = relationship("Producto", back_populates="calificaciones")
    usuario = relationship("Usuario", back_populates="calificaciones")