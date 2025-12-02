from typing import List, Optional
from datetime import datetime
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, field_validator

class CustomerBranch(BaseModel):
    branch_name: str
    address: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    is_main: bool = False
    is_active: bool = True

class Customer(Document):
    name: str
    ruc: Indexed(str, unique=True)
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branches: List[CustomerBranch] = []
    created_at: datetime = datetime.now()

    class Settings:
        name = "customers"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    INVOICED = "INVOICED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"

# Renombrado de OrderItem a SalesOrderDetail
class SalesOrderDetail(BaseModel):
    product_sku: str
    quantity: int
    unit_price: float

    @field_validator('unit_price')
    @classmethod
    def round_price(cls, v):
        return round(v, 3) if v is not None else v

class SalesOrder(Document):
    order_number: Indexed(str, unique=True)
    customer_id: str
    date: datetime = datetime.now()
    items: List[SalesOrderDetail]
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0
    delivery_branch_name: Optional[str] = None
    delivery_address: str

    @field_validator('total_amount')
    @classmethod
    def round_total(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "sales_orders"

# Renombrado de Payment a SalesPayment
class SalesPayment(BaseModel):
    amount: float
    date: datetime
    notes: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def round_amount(cls, v):
        return round(v, 3) if v is not None else v

class SalesInvoice(Document):
    invoice_number: Indexed(str, unique=True)
    order_id: str
    customer_id: str
    invoice_date: datetime = datetime.now()
    items: List[SalesOrderDetail]
    total_amount: float = 0.0
    delivery_branch_name: Optional[str] = None
    delivery_address: str
    payment_status: PaymentStatus = PaymentStatus.PENDING
    amount_paid: float = 0.0
    payments: List[SalesPayment] = []
    dispatch_status: str = "NOT_DISPATCHED"
    guide_id: Optional[str] = None

    @field_validator('total_amount', 'amount_paid')
    @classmethod
    def round_amounts(cls, v):
        return round(v, 3) if v is not None else v

    class Settings:
        name = "sales_invoices"
