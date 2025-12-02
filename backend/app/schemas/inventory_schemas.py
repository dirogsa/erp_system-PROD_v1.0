from pydantic import BaseModel
from typing import List, Optional
from app.models.inventory import Product, MovementType

class MeasurementFilter(BaseModel):
    label: str
    unit: str
    min: Optional[float] = None
    max: Optional[float] = None

class ProductSearchRequest(BaseModel):
    measurementFilters: Optional[List[MeasurementFilter]] = None
    search: Optional[str] = None
    skip: Optional[int] = 0
    limit: Optional[int] = 50

class TransferItem(BaseModel):
    sku: str
    quantity: int

class TransferRequest(BaseModel):
    target_warehouse_id: str
    items: List[TransferItem]
    notes: Optional[str] = None

class PaginatedProducts(BaseModel):
    items: List[Product]
    total: int
