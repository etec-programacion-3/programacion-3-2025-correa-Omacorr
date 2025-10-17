# app/crud/producto.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import Optional, List
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoUpdate

def get_producto_by_id(db: Session, producto_id: int) -> Optional[Producto]:
    """Obtiene un producto por su ID"""
    return db.query(Producto).filter(Producto.id == producto_id).first()

def get_productos(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    categoria: Optional[str] = None,
    vendedor_id: Optional[int] = None,
    activos_solo: bool = True
) -> List[Producto]:
    """
    Obtiene una lista de productos con filtros opcionales
    """
    query = db.query(Producto)
    
    # Aplicar filtros
    if activos_solo:
        query = query.filter(Producto.is_active == True)
    
    if categoria:
        query = query.filter(Producto.categoria == categoria)
    
    if vendedor_id:
        query = query.filter(Producto.vendedor_id == vendedor_id)
    
    # Ordenar por más recientes primero
    query = query.order_by(desc(Producto.created_at))
    
    return query.offset(skip).limit(limit).all()

def get_productos_count(
    db: Session,
    categoria: Optional[str] = None,
    vendedor_id: Optional[int] = None,
    activos_solo: bool = True
) -> int:
    """Cuenta el total de productos (para paginación)"""
    query = db.query(Producto)
    
    if activos_solo:
        query = query.filter(Producto.is_active == True)
    
    if categoria:
        query = query.filter(Producto.categoria == categoria)
    
    if vendedor_id:
        query = query.filter(Producto.vendedor_id == vendedor_id)
    
    return query.count()

def search_productos(db: Session, search_term: str, skip: int = 0, limit: int = 100) -> List[Producto]:
    """
    Busca productos por nombre o descripción
    """
    search_pattern = f"%{search_term}%"
    return db.query(Producto).filter(
        and_(
            Producto.is_active == True,
            or_(
                Producto.nombre.ilike(search_pattern),
                Producto.descripcion.ilike(search_pattern)
            )
        )
    ).offset(skip).limit(limit).all()

def create_producto(db: Session, producto: ProductoCreate, vendedor_id: int) -> Producto:
    """
    Crea un nuevo producto asociado a un vendedor
    """
    db_producto = Producto(
        nombre=producto.nombre,
        descripcion=producto.descripcion,
        precio=producto.precio,
        stock=producto.stock,
        categoria=producto.categoria,
        imagen_url=producto.imagen_url,
        vendedor_id=vendedor_id
    )
    
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    
    return db_producto

def update_producto(
    db: Session, 
    producto_id: int, 
    producto_update: ProductoUpdate
) -> Optional[Producto]:
    """
    Actualiza un producto existente
    """
    db_producto = get_producto_by_id(db, producto_id)
    if not db_producto:
        return None
    
    # Actualizar solo los campos proporcionados
    update_data = producto_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_producto, field, value)
    
    db.commit()
    db.refresh(db_producto)
    return db_producto

def delete_producto(db: Session, producto_id: int) -> bool:
    """
    Elimina un producto (soft delete - marca como inactivo)
    """
    db_producto = get_producto_by_id(db, producto_id)
    if not db_producto:
        return False
    
    db_producto.is_active = False
    db.commit()
    return True

def is_producto_owner(db: Session, producto_id: int, usuario_id: int) -> bool:
    """
    Verifica si un usuario es el dueño de un producto
    """
    producto = get_producto_by_id(db, producto_id)
    if not producto:
        return False
    return producto.vendedor_id == usuario_id