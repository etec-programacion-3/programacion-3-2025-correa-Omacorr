from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Conversacion(Base, TimestampMixin):
    __tablename__ = "conversaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario1_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    usuario2_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    usuario1 = relationship("Usuario", foreign_keys=[usuario1_id], back_populates="conversaciones_iniciadas")
    usuario2 = relationship("Usuario", foreign_keys=[usuario2_id], back_populates="conversaciones_recibidas")
    mensajes = relationship("Mensaje", back_populates="conversacion", cascade="all, delete-orphan")

class Mensaje(Base):
    __tablename__ = "mensajes"
    
    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id"), nullable=False)
    remitente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    contenido = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False)
    is_read = Column(Boolean, default=False)
    
    # Relaciones
    conversacion = relationship("Conversacion", back_populates="mensajes")
    remitente = relationship("Usuario", back_populates="mensajes_enviados")