from typing import List, Optional
from datetime import datetime
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, field_validator, Field

class Supplier(Document):
    name: Indexed(str, unique=True)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "suppliers"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    RECEIVED = "RECEIVED"
    INVOICED = "INVOICED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"

class OrderDetail(BaseModel):
    product_sku: str
    quantity: int
    unit_cost: float

    @field_validator('unit_cost')
    @classmethod
    def round_cost(cls, v):
        return round(v, 3) if v is not None else v

class Order(Document):
    order_number: Indexed(str, unique=True)
    supplier_id: str
    date: datetime = Field(default_factory=datetime.now)
    items: List[OrderDetail]
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0

    @field_validator('total_amount')
    @classmethod
    def round_total(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "purchase_orders"

class Payment(BaseModel):
    amount: float
    date: datetime
    notes: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def round_amount(cls, v):
        return round(v, 3) if v is not None else v

class Invoice(Document):
    invoice_number: Indexed(str, unique=True)
    order_id: str
    supplier_id: str
    invoice_date: datetime = Field(default_factory=datetime.now)
    items: List[OrderDetail]
    total_amount: float = 0.0
    payment_status: PaymentStatus = PaymentStatus.PENDING
    amount_paid: float = 0.0
    payments: List[Payment] = []
    reception_status: str = "NOT_RECEIVED"
    guide_id: Optional[str] = None
    debit_note_ids: List[str] = []
    debit_applied: float = 0.0

    @field_validator('total_amount', 'amount_paid', 'debit_applied')
    @classmethod
    def round_amounts(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "purchase_invoices"

# --- New Models for Debit Notes ---

class DebitNoteReason(str, Enum):
    RETURN = "RETURN"
    PRICE_CORRECTION = "PRICE_CORRECTION"
    OTHER = "OTHER"

class DebitNoteStatus(str, Enum):
    DRAFT = "DRAFT"
    APPLIED = "APPLIED"
    CANCELLED = "CANCELLED"

class DebitNoteItem(BaseModel):
    product_sku: str
    quantity: int
    unit_cost: float
    reason: Optional[str] = None

    @field_validator('unit_cost')
    @classmethod
    def round_cost(cls, v):
        return round(v, 3) if v is not None else v

class DebitNote(Document):
    debit_note_number: Indexed(str, unique=True)
    purchase_invoice_id: str
    supplier_id: str
    date: datetime = Field(default_factory=datetime.now)
    reason: DebitNoteReason
    status: DebitNoteStatus = DebitNoteStatus.DRAFT
    items: List[DebitNoteItem]
    total_amount: float
    notes: Optional[str] = None

    @field_validator('total_amount')
    @classmethod
    def round_total(cls, v):
        return round(v, 3)

    class Settings:
        name = "purchase_debit_notes"
