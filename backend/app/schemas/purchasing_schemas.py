from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId

# Assuming these enums are defined in the models as shown before
from app.models.purchasing import OrderStatus, PaymentStatus, DebitNoteReason, DebitNoteStatus

# --- Schemas for Suppliers ---
class Supplier(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            PydanticObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

# --- Schemas for Order Details ---
class OrderDetailSchema(BaseModel):
    product_sku: str
    quantity: int
    unit_cost: float

    class Config:
        orm_mode = True

# --- Schemas for Purchase Orders ---
class PurchaseOrder(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    order_number: str
    supplier_id: str
    date: datetime
    items: List[OrderDetailSchema]
    status: OrderStatus
    total_amount: float

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            PydanticObjectId: str
        }

# --- Schemas for Purchase Invoices ---
class PurchaseInvoice(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    invoice_number: str
    order_id: str
    supplier_id: str
    invoice_date: datetime
    items: List[OrderDetailSchema]
    total_amount: float
    payment_status: PaymentStatus
    amount_paid: float
    # Extended details for frontend
    supplier_name: Optional[str] = None 
    order_number: Optional[str] = None 

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            PydanticObjectId: str
        }

# --- Schemas for Debit Note Items ---
class DebitNoteItemSchema(BaseModel):
    product_sku: str
    quantity: int
    unit_cost: float
    reason: Optional[str] = None

    class Config:
        orm_mode = True

# --- Schemas for Debit Notes (Existing and New) ---

class DebitNoteCreate(BaseModel):
    reason: DebitNoteReason
    items: List[DebitNoteItemSchema]
    notes: Optional[str] = None

class DebitNoteResponse(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    debit_note_number: str
    purchase_invoice_id: str  # Corrected type to str
    supplier_id: str          # Corrected type to str
    date: datetime
    reason: DebitNoteReason
    status: DebitNoteStatus
    items: List[DebitNoteItemSchema]
    total_amount: float
    notes: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            PydanticObjectId: str
        }
