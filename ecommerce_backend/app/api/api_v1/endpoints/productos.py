# app/api/api_v1/endpoints/productos.py
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