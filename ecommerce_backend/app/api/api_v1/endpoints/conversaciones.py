from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from app.utils.notifications import enviar_notificacion_mensaje, enviar_notificacion_email_simulado

from app.database import get_db
from app.schemas.mensaje import (
    ConversacionCreate,
    ConversacionResponse,
    ConversacionConUsuario,
    MensajeCreate,
    MensajeResponse,
    MensajeConRemitente
)
from app.crud.mensaje import (
    get_conversacion_by_id,
    get_conversacion_entre_usuarios,
    get_conversaciones_usuario,
    create_conversacion,
    is_usuario_in_conversacion,
    get_mensajes_conversacion,
    create_mensaje,
    marcar_mensajes_como_leidos,
    get_mensajes_no_leidos_count
)
from app.crud.usuario import get_user_by_id
from app.api.deps import get_current_active_user
from app.models.usuario import Usuario

router = APIRouter()

@router.post("/", response_model=ConversacionResponse, status_code=status.HTTP_201_CREATED)
def crear_conversacion(
    conversacion_data: ConversacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Inicia una conversación con otro usuario
    """
    # Verificar que el otro usuario existe
    otro_usuario = get_user_by_id(db, conversacion_data.usuario2_id)
    if not otro_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {conversacion_data.usuario2_id} no encontrado"
        )
    
    # Verificar que no sea el mismo usuario
    if current_user.id == conversacion_data.usuario2_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes crear una conversación contigo mismo"
        )
    
    try:
        # Crear o retornar conversación existente
        conversacion = create_conversacion(
            db=db,
            usuario1_id=current_user.id,
            usuario2_id=conversacion_data.usuario2_id
        )
        return conversacion
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[ConversacionConUsuario])
def listar_conversaciones(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Lista todas las conversaciones del usuario autenticado
    """
    conversaciones = get_conversaciones_usuario(
        db=db,
        usuario_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    # Construir respuesta con información del otro usuario
    result = []
    for conv in conversaciones:
        # Determinar quién es el otro usuario
        otro_usuario_id = conv.usuario2_id if conv.usuario1_id == current_user.id else conv.usuario1_id
        otro_usuario = get_user_by_id(db, otro_usuario_id)
        
        if not otro_usuario:
            continue
        
        # Obtener último mensaje
        mensajes = get_mensajes_conversacion(db, conv.id, skip=0, limit=100)
        ultimo_mensaje = mensajes[-1] if mensajes else None
        
        # Contar mensajes no leídos
        mensajes_no_leidos = get_mensajes_no_leidos_count(db, conv.id, current_user.id)
        
        result.append(ConversacionConUsuario(
            id=conv.id,
            otro_usuario_id=otro_usuario.id,
            otro_usuario_username=otro_usuario.username,
            otro_usuario_nombre=f"{otro_usuario.nombre} {otro_usuario.apellido}",
            ultimo_mensaje=ultimo_mensaje.contenido[:50] + "..." if ultimo_mensaje and len(ultimo_mensaje.contenido) > 50 else (ultimo_mensaje.contenido if ultimo_mensaje else None),
            ultimo_mensaje_fecha=ultimo_mensaje.created_at if ultimo_mensaje else None,
            mensajes_no_leidos=mensajes_no_leidos,
            created_at=conv.created_at
        ))
    
    return result

@router.get("/{conversacion_id}", response_model=ConversacionResponse)
def obtener_conversacion(
    conversacion_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtiene los detalles de una conversación específica
    """
    conversacion = get_conversacion_by_id(db, conversacion_id)
    
    if not conversacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversación con ID {conversacion_id} no encontrada"
        )
    
    # Verificar que el usuario participa en la conversación
    if not is_usuario_in_conversacion(db, conversacion_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta conversación"
        )
    
    return conversacion

@router.post("/{conversacion_id}/messages", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
def enviar_mensaje(
    conversacion_id: int,
    mensaje_data: MensajeCreate,
    background_tasks: BackgroundTasks,  # ← NUEVO parámetro
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Envía un mensaje en una conversación existente
    
    ⚡ Nota: Después de guardar el mensaje, se ejecuta una tarea en segundo plano
    que simula el envío de una notificación al destinatario.
    """
    # Verificar que la conversación existe
    conversacion = get_conversacion_by_id(db, conversacion_id)
    if not conversacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversación con ID {conversacion_id} no encontrada"
        )
    
    # Verificar que el usuario participa en la conversación
    if not is_usuario_in_conversacion(db, conversacion_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para enviar mensajes en esta conversación"
        )
    
    # Crear el mensaje
    mensaje = create_mensaje(
        db=db,
        conversacion_id=conversacion_id,
        remitente_id=current_user.id,
        contenido=mensaje_data.contenido
    )
    
    # Determinar quién es el destinatario
    destinatario_id = conversacion.usuario2_id if conversacion.usuario1_id == current_user.id else conversacion.usuario1_id
    destinatario = get_user_by_id(db, destinatario_id)
    
    # Agregar tarea en segundo plano para notificar al destinatario
    if destinatario:
        background_tasks.add_task(
            enviar_notificacion_mensaje,
            remitente_username=current_user.username,
            destinatario_username=destinatario.username,
            contenido_mensaje=mensaje_data.contenido,
            conversacion_id=conversacion_id
        )
        
        # Opcionalmente, enviar notificación por email (simulado)
        background_tasks.add_task(
            enviar_notificacion_email_simulado,
            destinatario_email=destinatario.email,
            asunto=f"Nuevo mensaje de {current_user.username}",
            contenido=f"{current_user.username} te ha enviado un mensaje: {mensaje_data.contenido[:100]}"
        )
    
    return mensaje

@router.get("/{conversacion_id}/messages", response_model=List[MensajeConRemitente])
def listar_mensajes(
    conversacion_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Lista todos los mensajes de una conversación
    """
    # Verificar que la conversación existe
    conversacion = get_conversacion_by_id(db, conversacion_id)
    if not conversacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversación con ID {conversacion_id} no encontrada"
        )
    
    # Verificar que el usuario participa en la conversación
    if not is_usuario_in_conversacion(db, conversacion_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver los mensajes de esta conversación"
        )
    
    # Obtener mensajes
    mensajes = get_mensajes_conversacion(db, conversacion_id, skip, limit)
    
    # Marcar mensajes como leídos
    marcar_mensajes_como_leidos(db, conversacion_id, current_user.id)
    
    # Construir respuesta con información del remitente
    result = []
    for mensaje in mensajes:
        remitente = get_user_by_id(db, mensaje.remitente_id)
        if not remitente:
            continue
        
        result.append(MensajeConRemitente(
            id=mensaje.id,
            conversacion_id=mensaje.conversacion_id,
            remitente_id=mensaje.remitente_id,
            remitente_username=remitente.username,
            remitente_nombre=f"{remitente.nombre} {remitente.apellido}",
            contenido=mensaje.contenido,
            created_at=mensaje.created_at,
            is_read=mensaje.is_read
        ))
    
    return result