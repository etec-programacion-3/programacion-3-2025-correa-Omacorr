from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .core.config import settings
from .models.base import Base

# Crear el engine
engine = create_engine(
    settings.DATABASE_URL,
    # Para SQLite
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

# Crear el SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para crear las tablas
def create_tables():
    # Importar todos los modelos para que SQLAlchemy los registre
    from .models import usuario, producto, pedido, mensaje, calificacion
    Base.metadata.create_all(bind=engine)