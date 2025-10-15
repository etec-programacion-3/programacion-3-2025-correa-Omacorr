from sqlalchemy.orm import Session
from app import models, schemas

# 🔹 Crear producto
def crear_producto(db: Session, producto: schemas.ProductoCreate, vendedor_id: int):
    nuevo = models.Producto(**producto.dict(), vendedor_id=vendedor_id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

# 🔹 Listar todos los productos activos
def obtener_productos(db: Session, skip: int = 0, limit: int = 20):
    return db.query(models.Producto).filter(models.Producto.is_active == True).offset(skip).limit(limit).all()

# 🔹 Obtener un producto por ID
def obtener_producto(db: Session, producto_id: int):
    return db.query(models.Producto).filter(models.Producto.id == producto_id).first()

# 🔹 Actualizar producto (solo dueño)
def actualizar_producto(db: Session, producto_id: int, data: schemas.ProductoUpdate, vendedor_id: int):
    producto = obtener_producto(db, producto_id)
    if not producto:
        return None
    if producto.vendedor_id != vendedor_id:
        return "forbidden"
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(producto, key, value)
    db.commit()
    db.refresh(producto)
    return producto

# 🔹 Eliminar (lógico) producto (solo dueño)
def eliminar_producto(db: Session, producto_id: int, vendedor_id: int):
    producto = obtener_producto(db, producto_id)
    if not producto:
        return None
    if producto.vendedor_id != vendedor_id:
        return "forbidden"
    
    producto.is_active = False
    db.commit()
    return True
