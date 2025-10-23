from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, List, Dict
from datetime import datetime
from app.models.calificacion import CalificacionProducto
from app.models.usuario import Usuario
from app.schemas.calificacion import CalificacionCreate, CalificacionUpdate

def get_calificacion_by_id(db: Session, calificacion_id: int) -> Optional[CalificacionProducto]:
    """Obtiene una calificación por su ID"""
    return db.query(CalificacionProducto).filter(CalificacionProducto.id == calificacion_id).first()

def get_calificacion_usuario_producto(
    db: Session,
    usuario_id: int,
    producto_id: int
) -> Optional[CalificacionProducto]:
    """Verifica si un usuario ya calificó un producto específico"""
    return db.query(CalificacionProducto).filter(
        and_(
            CalificacionProducto.usuario_id == usuario_id,
            CalificacionProducto.producto_id == producto_id
        )
    ).first()

def get_calificaciones_producto(
    db: Session,
    producto_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[CalificacionProducto]:
    """Obtiene todas las calificaciones de un producto"""
    return db.query(CalificacionProducto).filter(
        CalificacionProducto.producto_id == producto_id
    ).order_by(CalificacionProducto.created_at.desc()).offset(skip).limit(limit).all()

def get_promedio_calificacion(db: Session, producto_id: int) -> float:
    """Calcula el promedio de calificaciones de un producto"""
    resultado = db.query(
        func.avg(CalificacionProducto.puntuacion)
    ).filter(
        CalificacionProducto.producto_id == producto_id
    ).scalar()
    
    return round(float(resultado), 2) if resultado else 0.0

def get_estadisticas_calificaciones(db: Session, producto_id: int) -> Dict:
    """Obtiene estadísticas detalladas de calificaciones de un producto"""
    total = db.query(CalificacionProducto).filter(
        CalificacionProducto.producto_id == producto_id
    ).count()
    
    if total == 0:
        return {
            "total_calificaciones": 0,
            "promedio": 0.0,
            "estrellas_5": 0,
            "estrellas_4": 0,
            "estrellas_3": 0,
            "estrellas_2": 0,
            "estrellas_1": 0
        }
    
    promedio = get_promedio_calificacion(db, producto_id)
    
    distribucion = {}
    for estrellas in range(1, 6):
        count = db.query(CalificacionProducto).filter(
            and_(
                CalificacionProducto.producto_id == producto_id,
                CalificacionProducto.puntuacion == estrellas
            )
        ).count()
        distribucion[f"estrellas_{estrellas}"] = count
    
    return {
        "total_calificaciones": total,
        "promedio": promedio,
        **distribucion
    }

def create_calificacion(
    db: Session,
    producto_id: int,
    usuario_id: int,
    calificacion: CalificacionCreate
) -> CalificacionProducto:
    """Crea una nueva calificación para un producto"""
    calificacion_existente = get_calificacion_usuario_producto(db, usuario_id, producto_id)
    if calificacion_existente:
        raise ValueError("Ya has calificado este producto. Usa el endpoint de actualización.")
    
    db_calificacion = CalificacionProducto(
        producto_id=producto_id,
        usuario_id=usuario_id,
        puntuacion=calificacion.puntuacion,
        comentario=calificacion.comentario,
        created_at=datetime.utcnow()
    )
    
    db.add(db_calificacion)
    db.commit()
    db.refresh(db_calificacion)
    
    return db_calificacion

def update_calificacion(
    db: Session,
    calificacion_id: int,
    calificacion_update: CalificacionUpdate
) -> Optional[CalificacionProducto]:
    """Actualiza una calificación existente"""
    db_calificacion = get_calificacion_by_id(db, calificacion_id)
    if not db_calificacion:
        return None
    
    update_data = calificacion_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_calificacion, field, value)
    
    db.commit()
    db.refresh(db_calificacion)
    return db_calificacion

def delete_calificacion(db: Session, calificacion_id: int) -> bool:
    """Elimina una calificación"""
    db_calificacion = get_calificacion_by_id(db, calificacion_id)
    if not db_calificacion:
        return False
    
    db.delete(db_calificacion)
    db.commit()
    return True