from typing import List, Optional
from datetime import datetime
from enum import Enum
from beanie import Document, Indexed
from pydantic import BaseModel, field_validator

class OrderStatus(str, Enum):
    PENDING = "PENDING"      # Orden creada, sin facturar
    INVOICED = "INVOICED"    # Facturada
    CANCELLED = "CANCELLED"  # Cancelada

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"  # Pago parcial
    PAID = "PAID"

class OrderItem(BaseModel):
    product_sku: str
    quantity: int
    unit_price: float

    @field_validator('unit_price')
    @classmethod
    def round_price(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

class Payment(BaseModel):
    """Registro individual de un pago"""
    amount: float
    date: datetime
    notes: Optional[str] = None

    @field_validator('amount')
    @classmethod
    def round_amount(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

class SalesOrder(Document):
    """Orden de venta (Proforma) - Inmutable después de facturar"""
    order_number: Optional[str] = None  # SALE-0001, SALE-0002, etc.
    customer_name: str
    customer_ruc: str  # RUC del cliente para referencia
    date: datetime = datetime.now()
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.PENDING
    total_amount: float = 0.0
    
    # Dirección de entrega
    delivery_branch_name: Optional[str] = None  # Nombre de la sucursal
    delivery_address: str  # Dirección de entrega (obligatorio)

    @field_validator('total_amount')
    @classmethod
    def round_total(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

    class Settings:
        name = "sales_orders"

class SalesInvoice(Document):
    """Factura de venta - Documento fiscal independiente"""
    invoice_number: str  # F001-00001
    order_number: str  # Referencia a la orden (SALE-0001)
    customer_name: str  # Denormalizado para queries rápidas
    customer_ruc: str  # RUC del cliente
    invoice_date: datetime = datetime.now()
    items: List[OrderItem]
    total_amount: float = 0.0
    
    # Dirección de entrega (denormalizado desde orden)
    delivery_branch_name: Optional[str] = None
    delivery_address: str
    
    # Control de pagos
    payment_status: PaymentStatus = PaymentStatus.PENDING
    amount_paid: float = 0.0
    payments: List[Payment] = []  # Historial de pagos
    
    # Control de despacho
    dispatch_status: str = "NOT_DISPATCHED"  # NOT_DISPATCHED | DISPATCHED
    guide_id: Optional[str] = None           # Referencia a DeliveryGuide

    @field_validator('total_amount', 'amount_paid')
    @classmethod
    def round_amounts(cls, v):
        """Redondear a 3 decimales"""
        return round(v, 3) if v is not None else v

    class Settings:
        name = "sales_invoices"

class CustomerBranch(BaseModel):
    """Sucursal de un cliente"""
    branch_name: str  # "Sede Principal", "Sucursal Ate", etc.
    address: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    is_main: bool = False
    is_active: bool = True

class Customer(Document):
    name: str
    ruc: Indexed(str, unique=True)  # RUC único para búsqueda/autocompletado
    address: Optional[str] = None  # Dirección principal (retrocompatibilidad)
    phone: Optional[str] = None
    email: Optional[str] = None
    branches: List[CustomerBranch] = []  # Sucursales del cliente
    created_at: datetime = datetime.now()

    class Settings:
        name = "customers"

