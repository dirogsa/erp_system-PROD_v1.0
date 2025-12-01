from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, field_validator

class Warehouse(Document):
    name: str
    code: Indexed(str, unique=True)
    address: str
    is_main: bool = False
    is_active: bool = True
    
    class Settings:
        name = "warehouses"

class MovementType(str, Enum):
    IN = "IN"   # Entrada (Compras, Devoluciones)
    OUT = "OUT" # Salida (Ventas)
    ADJUSTMENT = "ADJUSTMENT" # Ajuste manual
    TRANSFER_IN = "TRANSFER_IN"   # Entrada por transferencia
    TRANSFER_OUT = "TRANSFER_OUT" # Salida por transferencia
    
    # Tipos de Merma
    LOSS_DAMAGED = "LOSS_DAMAGED"        # Deteriorado/Roto
    LOSS_DEFECTIVE = "LOSS_DEFECTIVE"    # Defecto de fábrica
    LOSS_HUMIDITY = "LOSS_HUMIDITY"      # Dañado por humedad
    LOSS_EXPIRED = "LOSS_EXPIRED"        # Vencido/Caducado
    LOSS_THEFT = "LOSS_THEFT"            # Robo
    LOSS_OTHER = "LOSS_OTHER"            # Otra merma

class Product(Document):
    sku: Indexed(str, unique=True)
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float
    cost: float = 0.0
    # Measurements: list of small measurement objects (label, unit, value)
    measurements: Optional[List[Dict]] = None
    stock_current: int = 0
    created_at: datetime = datetime.now()

    @field_validator('price', 'cost')
    @classmethod
    def round_amounts(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

    class Settings:
        name = "products"

class StockMovement(Document):
    product_sku: str
    quantity: int
    movement_type: MovementType
    
    warehouse_id: Optional[str] = None          # Origen / Ubicación del movimiento
    target_warehouse_id: Optional[str] = None   # Solo para TRANSFER
    
    unit_cost: Optional[float] = None  # Costo unitario de este lote específico
    reference_document: str # ID de Factura o Orden
    date: datetime = datetime.now()
    notes: Optional[str] = None          # Notas detalladas
    responsible: Optional[str] = None    # Quién registró

    @field_validator('unit_cost')
    @classmethod
    def round_cost(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

    class Settings:
        name = "stock_movements"

class GuideType(str, Enum):
    RECEPTION = "RECEPTION"         # Recepción de compra
    DISPATCH = "DISPATCH"           # Despacho de venta
    TRANSFER = "TRANSFER"           # Transferencia a sucursal

class GuideStatus(str, Enum):
    PENDING = "PENDING"             # Creada pero no confirmada
    COMPLETED = "COMPLETED"         # Confirmada y stock movido
    CANCELLED = "CANCELLED"         # Cancelada

class GuideItem(BaseModel):
    sku: str
    product_name: str
    quantity: int
    unit_cost: float

class DeliveryGuide(Document):
    guide_number: Indexed(str, unique=True)
    guide_type: GuideType
    status: GuideStatus = GuideStatus.PENDING
    
    # Relaciones
    invoice_id: Optional[str] = None        # Factura asociada
    
    # Destino/Origen
    target: str                             # "Ate", "Cliente X", etc.
    delivery_address: Optional[str] = None  # Dirección de entrega específica
    
    # Productos
    items: list[GuideItem]
    
    # Fechas
    created_date: datetime = datetime.now()
    completed_date: Optional[datetime] = None
    
    # Observaciones
    notes: Optional[str] = None
    created_by: str
    
    @field_validator('items', mode='before')
    @classmethod
    def validate_items(cls, v):
        """Ensure items is a list"""
        if v is None:
            return []
        return v
    
    class Settings:
        name = "delivery_guides"

