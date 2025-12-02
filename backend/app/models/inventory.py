from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, field_validator, Field

class Warehouse(Document):
    name: str
    code: Indexed(str, unique=True)
    address: str
    is_main: bool = False
    is_active: bool = True
    
    class Settings:
        name = "warehouses"

class Category(Document):
    name: Indexed(str, unique=True)
    description: Optional[str] = None

    class Settings:
        name = "categories"

class MovementType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
    LOSS_DAMAGED = "LOSS_DAMAGED"
    LOSS_DEFECTIVE = "LOSS_DEFECTIVE"
    LOSS_HUMIDITY = "LOSS_HUMIDITY"
    LOSS_EXPIRED = "LOSS_EXPIRED"
    LOSS_THEFT = "LOSS_THEFT"
    LOSS_OTHER = "LOSS_OTHER"

class ProductHistory(Document):
    product_id: str
    timestamp: datetime = Field(default_factory=datetime.now)
    event_description: str
    changed_by: Optional[str] = None

    class Settings:
        name = "product_history"

class Product(Document):
    sku: Indexed(str, unique=True)
    name: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    price: float
    cost: float = 0.0
    measurements: Optional[List[Dict]] = None
    stock_current: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

    @field_validator('price', 'cost')
    @classmethod
    def round_amounts(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "products"

class StockMovement(Document):
    product_sku: str
    quantity: int
    movement_type: MovementType
    warehouse_id: Optional[str] = None
    target_warehouse_id: Optional[str] = None
    unit_cost: Optional[float] = None
    reference_document: str
    date: datetime = Field(default_factory=datetime.now)
    notes: Optional[str] = None
    responsible: Optional[str] = None

    @field_validator('unit_cost')
    @classmethod
    def round_cost(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "stock_movements"

class GuideType(str, Enum):
    RECEPTION = "RECEPTION"
    DISPATCH = "DISPATCH"
    TRANSFER = "TRANSFER"

class GuideStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class GuideItem(BaseModel):
    sku: str
    product_name: str
    quantity: int
    unit_cost: float

class DeliveryGuide(Document):
    guide_number: Indexed(str, unique=True)
    guide_type: GuideType
    status: GuideStatus = GuideStatus.PENDING
    invoice_id: Optional[str] = None
    target: str
    delivery_address: Optional[str] = None
    items: list[GuideItem]
    created_date: datetime = Field(default_factory=datetime.now)
    completed_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str
    
    @field_validator('items', mode='before')
    @classmethod
    def validate_items(cls, v):
        if v is None:
            return []
        return v
    
    class Settings:
        name = "delivery_guides"
