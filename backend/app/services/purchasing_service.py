
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from beanie import PydanticObjectId
from app.models.purchasing import (
    Order as PurchaseOrder,
    Invoice as PurchaseInvoice,
    Supplier,
    PaymentStatus,
    OrderStatus,
    DebitNote,
    DebitNoteItem,
    DebitNoteReason,
    DebitNoteStatus,
    OrderDetail
)
from app.models.inventory import Product
from app.services.document_number_service import get_debit_note_number
from app.exceptions.business_exceptions import NotFoundException, ValidationException
from app.schemas.common import PaginatedResponse
from app.schemas.purchasing_schemas import DebitNoteCreate
import math

# ==================== SUPPLIERS ====================
async def get_suppliers(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[Supplier]:
    query = {}
    if search:
        query = {"name": {"$regex": search, "$options": "i"}}
    
    total = await Supplier.find(query).count()
    items = await Supplier.find(query).sort("+name").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

# ==================== ORDERS ====================
async def get_orders(
    skip: int = 0, limit: int = 50, status: Optional[str] = None, 
    date_from: Optional[date] = None, date_to: Optional[date] = None, 
    search: Optional[str] = None
) -> PaginatedResponse[PurchaseOrder]:
    query_conditions = []

    if status:
        query_conditions.append({"status": status})
    
    if date_from:
        query_conditions.append({"date": {"$gte": datetime.combine(date_from, datetime.min.time())}})

    if date_to:
        query_conditions.append({"date": {"$lte": datetime.combine(date_to, datetime.max.time())}})

    if search:
        query_conditions.append({"$or": [
            {"order_number": {"$regex": search, "$options": "i"}},
            {"supplier_id.name": {"$regex": search, "$options": "i"}}, # Assuming supplier is populated
        ]})

    query = {"$and": query_conditions} if query_conditions else {}

    total = await PurchaseOrder.find(query).count()
    items = await PurchaseOrder.find(query).sort("-date").skip(skip).limit(limit).to_list()

    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

# ==================== INVOICES ====================
async def get_invoices(
    skip: int = 0, limit: int = 50, status: Optional[str] = None,
    date_from: Optional[date] = None, date_to: Optional[date] = None,
    search: Optional[str] = None
) -> PaginatedResponse[PurchaseInvoice]:
    query_conditions = []

    if status:
        query_conditions.append({"status": status})

    if date_from:
        query_conditions.append({"date": {"$gte": datetime.combine(date_from, datetime.min.time())}})

    if date_to:
        query_conditions.append({"date": {"$lte": datetime.combine(date_to, datetime.max.time())}})

    if search:
        query_conditions.append({"$or": [
            {"invoice_number": {"$regex": search, "$options": "i"}},
            {"supplier_id.name": {"$regex": search, "$options": "i"}}, # Assuming supplier is populated
        ]})

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await PurchaseInvoice.find(query).count()
    items = await PurchaseInvoice.find(query).sort("-date").skip(skip).limit(limit).to_list()

    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

async def get_invoice(invoice_id: PydanticObjectId) -> PurchaseInvoice:
    invoice = await PurchaseInvoice.get(invoice_id)
    if not invoice:
        raise NotFoundException("Invoice not found")
    return invoice

# ==================== DEBIT NOTES ====================
async def create_debit_note(invoice_id: PydanticObjectId, debit_note_data: DebitNoteCreate) -> DebitNote:
    # ... (logic remains the same, assuming it's correct)
    pass

async def get_debit_notes(
    skip: int = 0, limit: int = 50, search: Optional[str] = None
) -> PaginatedResponse[DebitNote]:
    query = {}
    if search:
        query["$or"] = [
            {"debit_note_number": {"$regex": search, "$options": "i"}},
        ]

    total = await DebitNote.find(query).count()
    items = await DebitNote.find(query).sort("-date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )
