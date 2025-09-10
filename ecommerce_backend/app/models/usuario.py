from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Usuario(Base, TimestampMixin):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    telefono = Column(String)
    direccion = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    productos_vendidos = relationship("Producto", back_populates="vendedor")
    pedidos = relationship("Pedido", back_populates="usuario")
    calificaciones = relationship("CalificacionProducto", back_populates="usuario")
    conversaciones_iniciadas = relationship("Conversacion", foreign_keys="[Conversacion.usuario1_id]", back_populates="usuario1")
    conversaciones_recibidas = relationship("Conversacion", foreign_keys="[Conversacion.usuario2_id]", back_populates="usuario2")
    mensajes_enviados = relationship("Mensaje", back_populates="remitente")
    