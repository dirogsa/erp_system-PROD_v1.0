from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.sales import PaymentStatus, CreditNoteReason, CreditNoteStatus, OrderStatus, SalesOrderDetail
from beanie import PydanticObjectId

# --- Schemas for Customers ---

class CustomerBranch(BaseModel):
    branch_name: str
    address: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    is_main: bool = False
    is_active: bool = True

class Customer(BaseModel):
    id: PydanticObjectId = Field(..., alias='_id')
    name: str
    ruc: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branches: List[CustomerBranch] = []

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            PydanticObjectId: str
        }

# --- Schemas for Sales Orders ---

class SalesOrderOut(BaseModel):
    id: PydanticObjectId = Field(..., alias='_id')
    order_number: str
    customer_id: str
    date: datetime
    items: List[SalesOrderDetail]
    status: OrderStatus
    total_amount: float
    delivery_branch_name: Optional[str] = None
    delivery_address: str

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            PydanticObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

# --- Schemas for Sales Invoices ---

class SalesInvoiceOut(BaseModel):
    id: PydanticObjectId = Field(..., alias='_id')
    invoice_number: str
    order_id: str
    customer_id: str
    invoice_date: datetime
    items: List[SalesOrderDetail]
    total_amount: float
    payment_status: PaymentStatus
    amount_paid: float

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            PydanticObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

# --- Schemas for Credit Notes ---

class CreditNoteItemSchema(BaseModel):
    product_sku: str
    quantity: int
    unit_price: float
    reason: Optional[str] = None

class CreditNoteCreate(BaseModel):
    reason: CreditNoteReason
    items: List[CreditNoteItemSchema]
    notes: Optional[str] = None
    date: datetime = Field(default_factory=datetime.now)

class CreditNoteResponse(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    credit_note_number: str
    sales_invoice_id: str
    customer_id: str
    date: datetime
    reason: CreditNoteReason
    status: CreditNoteStatus
    items: List[CreditNoteItemSchema]
    total_amount: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            PydanticObjectId: str,
            datetime: lambda dt: dt.strftime('%Y-%m-%d %H:%M:%S')
        }
