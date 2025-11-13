from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models.pedido import Pedido, ItemPedido
from app.models.producto import Producto
from app.api.deps import get_current_user
from app.models.usuario import Usuario 

router = APIRouter()

# Esquemas para requests
class ItemPedidoRequest(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class CrearPedidoRequest(BaseModel):
    items: List[ItemPedidoRequest]

@router.post("/orders/")
async def crear_pedido(
    pedido_data: CrearPedidoRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crear un nuevo pedido con sus items
    """
    try:
        # Calcular total y validar productos
        total_pedido = 0
        items_validados = []
        
        for item in pedido_data.items:
            # Verificar que el producto existe
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no encontrado")
            
            # Verificar stock
            if producto.stock < item.cantidad:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre}")
            
            total_pedido += item.precio_unitario * item.cantidad
            items_validados.append({
                "producto": producto,
                "cantidad": item.cantidad,
                "precio_unitario": item.precio_unitario,
                "subtotal": item.precio_unitario * item.cantidad
            })
        
        # Crear pedido principal
        nuevo_pedido = Pedido(
            usuario_id=current_user.id,
            total=total_pedido,
            estado="pendiente",
            direccion_envio="Dirección por defecto",
            fecha_pedido=datetime.now()
        )
        db.add(nuevo_pedido)
        db.flush()  # Para obtener ID
        
        # Crear items y actualizar stock
        items_creados = []
        for item_data in items_validados:
            # Crear item del pedido
            item_pedido = ItemPedido(
                pedido_id=nuevo_pedido.id,
                producto_id=item_data["producto"].id,
                cantidad=item_data["cantidad"],
                precio_unitario=item_data["precio_unitario"],
                subtotal=item_data["subtotal"]
            )
            db.add(item_pedido)
            
            # Reducir stock
            item_data["producto"].stock -= item_data["cantidad"]
            
            items_creados.append({
                "producto_id": item_data["producto"].id,
                "nombre": item_data["producto"].nombre,
                "cantidad": item_data["cantidad"],
                "precio_unitario": item_data["precio_unitario"],
                "subtotal": item_data["subtotal"]
            })
        
        db.commit()
        
        return {
            "message": "Pedido creado exitosamente",
            "pedido_id": nuevo_pedido.id,
            "total": float(total_pedido),
            "items": items_creados,
            "estado": "pendiente"
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/orders/")
async def obtener_pedidos(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener pedidos del usuario
    """
    pedidos = db.query(Pedido).filter(Pedido.usuario_id == current_user.id).all()
    return [
        {
            "id": p.id,
            "total": float(p.total),
            "estado": p.estado,
            "fecha_pedido": p.fecha_pedido,
            "direccion_envio": p.direccion_envio
        }
        for p in pedidos
    ]
