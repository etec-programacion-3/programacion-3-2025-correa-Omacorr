from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import Optional, List
from datetime import datetime
from app.models.mensaje import Conversacion, Mensaje
from app.models.usuario import Usuario

def get_conversacion_by_id(db: Session, conversacion_id: int) -> Optional[Conversacion]:
    """Obtiene una conversación por su ID"""
    return db.query(Conversacion).filter(Conversacion.id == conversacion_id).first()

def get_conversacion_entre_usuarios(db: Session, usuario1_id: int, usuario2_id: int) -> Optional[Conversacion]:
    """Busca si ya existe una conversación entre dos usuarios"""
    return db.query(Conversacion).filter(
        or_(
            and_(Conversacion.usuario1_id == usuario1_id, Conversacion.usuario2_id == usuario2_id),
            and_(Conversacion.usuario1_id == usuario2_id, Conversacion.usuario2_id == usuario1_id)
        )
    ).first()

def get_conversaciones_usuario(db: Session, usuario_id: int, skip: int = 0, limit: int = 50) -> List[Conversacion]:
    """Obtiene todas las conversaciones de un usuario"""
    return db.query(Conversacion).filter(
        and_(
            or_(Conversacion.usuario1_id == usuario_id, Conversacion.usuario2_id == usuario_id),
            Conversacion.is_active == True
        )
    ).order_by(desc(Conversacion.updated_at)).offset(skip).limit(limit).all()

def create_conversacion(db: Session, usuario1_id: int, usuario2_id: int) -> Conversacion:
    """Crea una nueva conversación entre dos usuarios"""
    if usuario1_id == usuario2_id:
        raise ValueError("No puedes crear una conversación contigo mismo")
    
    conversacion_existente = get_conversacion_entre_usuarios(db, usuario1_id, usuario2_id)
    if conversacion_existente:
        return conversacion_existente
    
    db_conversacion = Conversacion(usuario1_id=usuario1_id, usuario2_id=usuario2_id)
    db.add(db_conversacion)
    db.commit()
    db.refresh(db_conversacion)
    return db_conversacion

def is_usuario_in_conversacion(db: Session, conversacion_id: int, usuario_id: int) -> bool:
    """Verifica si un usuario participa en una conversación"""
    conversacion = get_conversacion_by_id(db, conversacion_id)
    if not conversacion:
        return False
    return usuario_id in [conversacion.usuario1_id, conversacion.usuario2_id]

def get_mensajes_conversacion(db: Session, conversacion_id: int, skip: int = 0, limit: int = 100) -> List[Mensaje]:
    """Obtiene los mensajes de una conversación"""
    return db.query(Mensaje).filter(Mensaje.conversacion_id == conversacion_id).order_by(Mensaje.created_at).offset(skip).limit(limit).all()

def create_mensaje(db: Session, conversacion_id: int, remitente_id: int, contenido: str) -> Mensaje:
    """Crea un nuevo mensaje en una conversación"""
    db_mensaje = Mensaje(
        conversacion_id=conversacion_id,
        remitente_id=remitente_id,
        contenido=contenido,
        created_at=datetime.utcnow(),
        is_read=False
    )
    db.add(db_mensaje)
    conversacion = get_conversacion_by_id(db, conversacion_id)
    if conversacion:
        conversacion.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_mensaje)
    return db_mensaje

def marcar_mensajes_como_leidos(db: Session, conversacion_id: int, usuario_id: int) -> int:
    """Marca todos los mensajes como leídos"""
    mensajes_no_leidos = db.query(Mensaje).filter(
        and_(
            Mensaje.conversacion_id == conversacion_id,
            Mensaje.remitente_id != usuario_id,
            Mensaje.is_read == False
        )
    ).all()
    count = 0
    for mensaje in mensajes_no_leidos:
        mensaje.is_read = True
        count += 1
    if count > 0:
        db.commit()
    return count

def get_mensajes_no_leidos_count(db: Session, conversacion_id: int, usuario_id: int) -> int:
    """Cuenta los mensajes no leídos"""
    return db.query(Mensaje).filter(
        and_(
            Mensaje.conversacion_id == conversacion_id,
            Mensaje.remitente_id != usuario_id,
            Mensaje.is_read == False
        )
    ).count()