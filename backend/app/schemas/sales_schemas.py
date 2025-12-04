from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from beanie import PydanticObjectId
from app.models.sales import CreditNoteReason, OrderStatus, PaymentStatus, CustomerBranch, CreditNoteItem as CreditNoteItemModel

# ===============================================
# ============= CUSTOMER SCHEMAS ================
# ===============================================

class CustomerBase(BaseModel):
    name: str
    ruc: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branches: List[CustomerBranch] = []

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    ruc: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branches: Optional[List[CustomerBranch]] = None

class CustomerRead(CustomerBase):
    id: PydanticObjectId = Field(..., alias="_id")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PydanticObjectId: str}

# ===============================================
# =========== SALES ORDER SCHEMAS ===============
# ===============================================

class SalesOrderDetail(BaseModel):
    product_sku: str
    quantity: int
    unit_price: float

class SalesOrderBase(BaseModel):
    customer_id: str
    date: datetime
    items: List[SalesOrderDetail]
    status: OrderStatus
    total_amount: float
    delivery_branch_name: Optional[str] = None
    delivery_address: str

class SalesOrderRead(SalesOrderBase):
    id: PydanticObjectId = Field(..., alias="_id")
    order_number: str

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PydanticObjectId: str}

# ===============================================
# ========== SALES INVOICE SCHEMAS ==============
# ===============================================

class SalesInvoiceBase(BaseModel):
    order_id: str
    customer_id: str
    invoice_date: datetime
    items: List[SalesOrderDetail]
    total_amount: float
    delivery_branch_name: Optional[str] = None
    delivery_address: str
    payment_status: PaymentStatus

class SalesInvoiceRead(SalesInvoiceBase):
    id: PydanticObjectId = Field(..., alias="_id")
    invoice_number: str

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PydanticObjectId: str}

# ===============================================
# ============ CREDIT NOTE SCHEMAS ==============
# ===============================================

class CreditNoteItem(BaseModel):
    product_sku: str
    quantity: int
    unit_price: float
    reason: Optional[str] = None

class CreditNoteCreate(BaseModel):
    sales_invoice_id: str
    reason: CreditNoteReason
    items: List[CreditNoteItem]
    notes: Optional[str] = None

class CreditNoteRead(BaseModel):
    id: PydanticObjectId = Field(..., alias="_id")
    credit_note_number: str
    sales_invoice_id: str
    customer_id: str
    date: datetime
    reason: CreditNoteReason
    status: str
    items: List[CreditNoteItemModel]
    total_amount: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PydanticObjectId: str}
