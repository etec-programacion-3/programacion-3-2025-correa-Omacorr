# app/utils/notifications.py
import logging
from datetime import datetime
from typing import Optional

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def enviar_notificacion_mensaje(
    remitente_username: str,
    destinatario_username: str,
    contenido_mensaje: str,
    conversacion_id: int
):
    """
    Tarea en segundo plano que simula el envío de una notificación
    cuando se envía un mensaje.
    
    En un sistema real, esto podría:
    - Enviar un email
    - Enviar una notificación push
    - Enviar un SMS
    - Notificar a través de WebSockets
    
    Por ahora, solo registra en el log.
    """
    # Truncar el mensaje si es muy largo
    mensaje_preview = contenido_mensaje[:50] + "..." if len(contenido_mensaje) > 50 else contenido_mensaje
    
    # Log principal de notificación
    logger.info(
        f"[🔔 NOTIFICATION SENT] User '{remitente_username}' sent a message to User '{destinatario_username}' "
        f"in conversation #{conversacion_id}"
    )
    
    # Log adicional con preview del mensaje
    logger.info(f"[💬 MESSAGE PREVIEW] {mensaje_preview}")
    
    # Simular escritura en archivo de log adicional
    try:
        with open("notifications.log", "a", encoding="utf-8") as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(
                f"{'=' * 80}\n"
                f"[{timestamp}] 🔔 NUEVA NOTIFICACIÓN\n"
                f"{'=' * 80}\n"
                f"Tipo: MENSAJE_NUEVO\n"
                f"De: {remitente_username}\n"
                f"Para: {destinatario_username}\n"
                f"Conversación ID: {conversacion_id}\n"
                f"Preview: {mensaje_preview}\n"
                f"Estado: ✅ Notificación procesada\n"
                f"{'=' * 80}\n\n"
            )
    except Exception as e:
        logger.error(f"❌ Error writing to notifications.log: {e}")
    
    # Aquí podrías agregar más lógica:
    # - Enviar email con SMTP
    # - Llamar a una API de notificaciones push
    # - Publicar en una cola de mensajes (Redis, RabbitMQ)
    # etc.

def enviar_notificacion_email_simulado(
    destinatario_email: str,
    asunto: str,
    contenido: str
):
    """
    Simula el envío de un email (tarea en segundo plano)
    
    En producción, esto usaría:
    - SendGrid
    - AWS SES
    - Mailgun
    - SMTP directo
    """
    logger.info(
        f"[📧 EMAIL NOTIFICATION] To: {destinatario_email} | "
        f"Subject: {asunto}"
    )
    
    try:
        with open("email_notifications.log", "a", encoding="utf-8") as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(
                f"\n{'*' * 80}\n"
                f"📧 EMAIL NOTIFICATION\n"
                f"{'*' * 80}\n"
                f"Timestamp: {timestamp}\n"
                f"To: {destinatario_email}\n"
                f"Subject: {asunto}\n"
                f"Content:\n"
                f"  {contenido}\n"
                f"Status: ✅ Email enviado (simulado)\n"
                f"{'*' * 80}\n\n"
            )
            logger.info(f"✅ Email notification logged successfully")
    except Exception as e:
        logger.error(f"❌ Error writing to email_notifications.log: {e}")

def procesar_tarea_larga_ejemplo(tarea_id: int, duracion_segundos: int = 5):
    """
    Ejemplo de una tarea que toma tiempo
    
    Demuestra por qué las background tasks son útiles:
    - La API responde inmediatamente
    - La tarea se ejecuta después
    - No bloquea al usuario
    """
    import time
    
    logger.info(f"[BACKGROUND TASK] Iniciando tarea #{tarea_id}...")
    
    # Simular procesamiento largo
    time.sleep(duracion_segundos)
    
    logger.info(f"[BACKGROUND TASK] Tarea #{tarea_id} completada después de {duracion_segundos}s")
    
    try:
        with open("background_tasks.log", "a") as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(
                f"[{timestamp}] Task #{tarea_id} completed after {duracion_segundos}s\n"
            )
    except Exception as e:
        logger.error(f"Error writing to background_tasks.log: {e}")