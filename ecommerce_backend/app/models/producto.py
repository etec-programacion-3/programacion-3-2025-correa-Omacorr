from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Producto(Base, TimestampMixin):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, index=True)
    descripcion = Column(Text)
    precio = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    categoria = Column(String, index=True)
    imagen_url = Column(String)
    vendedor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    vendedor = relationship("Usuario", back_populates="productos_vendidos")
    items_pedido = relationship("ItemPedido", back_populates="producto")
    calificaciones = relationship("CalificacionProducto", back_populates="producto")