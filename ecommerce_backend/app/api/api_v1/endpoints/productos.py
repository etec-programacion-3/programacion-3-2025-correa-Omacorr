from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.schemas.calificacion import (
    CalificacionCreate,
    CalificacionUpdate,
    CalificacionResponse,
    CalificacionConUsuario,
    CalificacionesStats
)
from app.crud.calificacion import (
    get_calificacion_usuario_producto,
    get_calificaciones_producto,
    get_promedio_calificacion,
    get_estadisticas_calificaciones,
    create_calificacion,
    update_calificacion,
    delete_calificacion
)

from app.database import get_db
from app.schemas.producto import (
    ProductoCreate,
    ProductoUpdate,
    ProductoResponse,
    ProductosPaginados
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
    
    return ProductosPaginados(
        total=total,
        page=page,
        page_size=page_size,
        productos=productos
    )

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
    Obtiene un producto específico por ID
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
    
    return producto

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

@router.post("/{producto_id}/reviews", response_model=CalificacionResponse, status_code=status.HTTP_201_CREATED)
def crear_calificacion_producto(
    producto_id: int,
    calificacion: CalificacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Crea una calificación para un producto"""
    producto = get_producto_by_id(db, producto_id)
    if not producto or not producto.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    if producto.vendedor_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes calificar tu propio producto"
        )
    
    try:
        nueva_calificacion = create_calificacion(
            db=db,
            producto_id=producto_id,
            usuario_id=current_user.id,
            calificacion=calificacion
        )
        return nueva_calificacion
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{producto_id}/reviews", response_model=CalificacionResponse)
def actualizar_calificacion_producto(
    producto_id: int,
    calificacion_update: CalificacionUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Actualiza la calificación existente del usuario"""
    producto = get_producto_by_id(db, producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    calificacion_existente = get_calificacion_usuario_producto(
        db, current_user.id, producto_id
    )
    
    if not calificacion_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No has calificado este producto aún. Usa el endpoint POST para crear una calificación."
        )
    
    calificacion_actualizada = update_calificacion(
        db, calificacion_existente.id, calificacion_update
    )
    
    return calificacion_actualizada

@router.get("/{producto_id}/reviews", response_model=List[CalificacionConUsuario])
def listar_calificaciones_producto(
    producto_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lista todas las calificaciones de un producto"""
    producto = get_producto_by_id(db, producto_id)
    if not producto or not producto.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    calificaciones = get_calificaciones_producto(db, producto_id, skip, limit)
    
    result = []
    for cal in calificaciones:
        usuario = get_user_by_id(db, cal.usuario_id)
        if not usuario:
            continue
        
        result.append(CalificacionConUsuario(
            id=cal.id,
            producto_id=cal.producto_id,
            usuario_id=cal.usuario_id,
            usuario_username=usuario.username,
            usuario_nombre=f"{usuario.nombre} {usuario.apellido}",
            puntuacion=cal.puntuacion,
            comentario=cal.comentario,
            created_at=cal.created_at
        ))
    
    return result

@router.get("/{producto_id}/reviews/stats", response_model=CalificacionesStats)
def obtener_estadisticas_calificaciones(
    producto_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene estadísticas de calificaciones de un producto"""
    producto = get_producto_by_id(db, producto_id)
    if not producto or not producto.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {producto_id} no encontrado"
        )
    
    stats = get_estadisticas_calificaciones(db, producto_id)
    
    return CalificacionesStats(**stats)

@router.delete("/{producto_id}/reviews", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_calificacion_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """Elimina la calificación del usuario para un producto"""
    calificacion_existente = get_calificacion_usuario_producto(
        db, current_user.id, producto_id
    )
    
    if not calificacion_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No has calificado este producto"
        )
    
    success = delete_calificacion(db, calificacion_existente.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar la calificación"
        )
    
    return None