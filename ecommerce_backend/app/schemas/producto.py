from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int = 0
    categoria: Optional[str] = None
    imagen_url: Optional[str] = None
    
    @validator('nombre')
    def validate_nombre(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('El nombre debe tener al menos 3 caracteres')
        return v.strip()
    
    @validator('precio')
    def validate_precio(cls, v):
        if v <= 0:
            raise ValueError('El precio debe ser mayor a 0')
        return v
    
    @validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('El stock no puede ser negativo')
        return v

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    categoria: Optional[str] = None
    imagen_url: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('nombre')
    def validate_nombre(cls, v):
        if v is not None and len(v.strip()) < 3:
            raise ValueError('El nombre debe tener al menos 3 caracteres')
        return v.strip() if v else v
    
    @validator('precio')
    def validate_precio(cls, v):
        if v is not None and v <= 0:
            raise ValueError('El precio debe ser mayor a 0')
        return v
    
    @validator('stock')
    def validate_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError('El stock no puede ser negativo')
        return v

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    categoria: Optional[str]
    imagen_url: Optional[str]
    vendedor_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductoConVendedor(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    categoria: Optional[str]
    imagen_url: Optional[str]
    vendedor_id: int
    vendedor_username: str
    vendedor_nombre: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductoEnLista(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    precio: float
    stock: int
    categoria: Optional[str]
    imagen_url: Optional[str]
    vendedor_username: str
    is_active: bool
    
    class Config:
        from_attributes = True

class ProductosPaginados(BaseModel):
    total: int
    page: int
    page_size: int
    productos: List[ProductoResponse]