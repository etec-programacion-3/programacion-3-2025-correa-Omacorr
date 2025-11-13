from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse,
    ProductosPaginados
)
from app.schemas.calificacion import (  # ← AGREGAR ESTOS IMPORTS
    CalificacionCreate,
    CalificacionResponse,
    CalificacionConUsuario
)
from app.crud.usuario import get_user_by_id
from app.crud.producto import (
    get_producto_by_id,
    get_productos,
    get_productos_count,
    search_productos,
    create_producto,
    update_producto,
    delete_producto,
    is_producto_owner
)
from app.crud.calificacion import (  # ← AGREGAR ESTOS IMPORTS
    create_calificacion,
    get_calificaciones_producto,
    get_promedio_calificacion,
    get_calificacion_usuario_producto
)
from app.api.deps import get_current_active_user
from app.models.usuario import Usuario

router = APIRouter()

@router.post("/", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Crea un nuevo producto asociado al usuario autenticado
    """
    try:
        nuevo_producto = create_producto(
            db=db,
            producto=producto,
            vendedor_id=current_user.id
        )
        return nuevo_producto
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear producto: {str(e)}"
        )

@router.get("/", response_model=ProductosPaginados)
def listar_productos(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Productos por página"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    vendedor_id: Optional[int] = Query(None, description="Filtrar por vendedor"),
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    db: Session = Depends(get_db)
):
    """
    Lista todos los productos con paginación
    """
    skip = (page - 1) * page_size
    
    if search:
        productos = search_productos(db, search_term=search, skip=skip, limit=page_size)
        total = len(productos)
    else:
        productos = get_productos(
            db=db,
            skip=skip,
            limit=page_size,
            categoria=categoria,
            vendedor_id=vendedor_id,
            activos_solo=True
        )
        total = get_productos_count(
            db=db,
            categoria=categoria,
            vendedor_id=vendedor_id,
            activos_solo=True
        )
    
    # Transformar productos para incluir información del vendedor
    productos_transformados = []
    for producto in productos:
        vendedor = get_user_by_id(db, producto.vendedor_id)
        producto_dict = {
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "precio": float(producto.precio),
            "stock": producto.stock,
            "categoria": producto.categoria,
            "imagen_url": producto.imagen_url,
            "vendedor_id": producto.vendedor_id,
            "vendedor_username": producto.vendedor.username if producto.vendedor else None,
            "vendedor_nombre": f"{producto.vendedor.nombre} {producto.vendedor.apellido}" if producto.vendedor else None,
            "is_active": producto.is_active,
            "created_at": producto.created_at,
            "updated_at": producto.updated_at
        }
        productos_transformados.append(producto_dict)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "productos": productos_transformados
    }

@router.get("/mis-productos", response_model=List[ProductoResponse])
def listar_mis_productos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Lista todos los productos del usuario autenticado
    """
    productos = get_productos(
        db=db,
        vendedor_id=current_user.id,
        activos_solo=False
    )
    return productos

@router.get("/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene un producto específico por ID con información del vendedor
    """
    producto = get_producto_by_id(db, producto_id)
    
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    if not producto.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no disponible"
        )
    
    # Agregar información del vendedor
    vendedor = get_user_by_id(db, producto.vendedor_id)
    
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "precio": float(producto.precio),
        "stock": producto.stock,
        "categoria": producto.categoria,
        "imagen_url": producto.imagen_url,
        "vendedor_id": producto.vendedor_id,
        "vendedor_username": vendedor.username if vendedor else None,
        "vendedor_nombre_completo": f"{vendedor.nombre} {vendedor.apellido}" if vendedor else None,
        "is_active": producto.is_active,
        "created_at": producto.created_at,
        "updated_at": producto.updated_at
    }

@router.put("/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int,
    producto_update: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Actualiza un producto (solo el dueño)
    """
    producto = get_producto_by_id(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    if not is_producto_owner(db, producto_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este producto"
        )
    
    producto_actualizado = update_producto(db, producto_id, producto_update)
    return producto_actualizado

@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Elimina un producto (solo el dueño)
    """
    producto = get_producto_by_id(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    if not is_producto_owner(db, producto_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este producto"
        )
    
    success = delete_producto(db, producto_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar el producto"
        )
    
    return None

# ← AGREGAR ESTOS NUEVOS ENDPOINTS DE CALIFICACIONES:

@router.post("/{producto_id}/reviews", response_model=CalificacionResponse)
def calificar_producto(
    producto_id: int,
    calificacion: CalificacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Calificar un producto después de comprarlo"""
    producto = get_producto_by_id(db, producto_id)
    if not producto or not producto.is_active:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if producto.vendedor_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes calificar tu propio producto")
    
    try:
        nueva_calificacion = create_calificacion(
            db=db,
            producto_id=producto_id,
            usuario_id=current_user.id,
            calificacion=calificacion
        )
        return nueva_calificacion
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{producto_id}/reviews")
def obtener_calificaciones(
    producto_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Obtener todas las calificaciones de un producto"""
    producto = get_producto_by_id(db, producto_id)
    if not producto or not producto.is_active:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    calificaciones = get_calificaciones_producto(db, producto_id, skip, limit)
    promedio = get_promedio_calificacion(db, producto_id)
    
    # Construir respuesta con información del usuario
    calificaciones_con_usuario = []
    for cal in calificaciones:
        usuario = get_user_by_id(db, cal.usuario_id)
        if usuario:
            calificaciones_con_usuario.append({
                "id": cal.id,
                "producto_id": cal.producto_id,
                "usuario_id": cal.usuario_id,
                "usuario_username": usuario.username,
                "usuario_nombre": f"{usuario.nombre} {usuario.apellido}",
                "puntuacion": cal.puntuacion,
                "comentario": cal.comentario,
                "created_at": cal.created_at
            })
    
    return {
        "promedio": promedio,
        "total": len(calificaciones),
        "calificaciones": calificaciones_con_usuario
    }

@router.get("/{producto_id}/reviews/my-review")
def obtener_mi_calificacion(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Obtener la calificación del usuario actual para este producto"""
    calificacion = get_calificacion_usuario_producto(db, current_user.id, producto_id)
    
    if not calificacion:
        return {"tiene_calificacion": False}
    
    return {
        "tiene_calificacion": True,
        "calificacion": {
            "puntuacion": calificacion.puntuacion,
            "comentario": calificacion.comentario,
            "created_at": calificacion.created_at
        }
    }