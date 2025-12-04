from typing import List, Optional, Dict, Any
from datetime import datetime
from beanie import PydanticObjectId
from app.models.sales import (
    SalesOrder, SalesInvoice, Customer, PaymentStatus, OrderStatus, 
    CreditNote, CreditNoteItem, CreditNoteReason, CreditNoteStatus, SalesOrderDetail
)
from app.models.inventory import DeliveryGuide, GuideType, GuideStatus, GuideItem, MovementType, StockMovement
from app.services import inventory_service
from app.services.document_number_service import get_credit_note_number
from app.exceptions.business_exceptions import NotFoundException, ValidationException, DuplicateException
from app.schemas.common import PaginatedResponse
from app.schemas.sales_schemas import CreditNoteCreate, CustomerCreate, CustomerUpdate
import math

# ================================================
# =============== CUSTOMERS ======================
# ================================================

async def create_customer(customer_data: CustomerCreate) -> Customer:
    """Creates a new customer, ensuring no duplicates based on tax ID (RUC)."""
    existing_customer = await Customer.find_one(Customer.ruc == customer_data.ruc)
    if existing_customer:
        raise DuplicateException(f"A customer with RUC {customer_data.ruc} already exists.")

    new_customer = Customer(**customer_data.model_dump())
    await new_customer.insert()
    return new_customer

async def get_customers(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[Customer]:
    """Retrieves a paginated list of customers."""
    query_conditions = []
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_conditions.append(
            {"$or": [
                {"name": search_regex},
                {"ruc": search_regex}
            ]}
        )

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await Customer.find(query).count()
    items = await Customer.find(query).sort("+name").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=math.ceil(skip / limit) + 1 if limit > 0 else 1,
        pages=math.ceil(total / limit) if limit > 0 else 1,
        size=limit
    )

async def get_customer_by_id(customer_id: str) -> Optional[Customer]:
    """Fetches a single customer by their ID."""
    customer = await Customer.get(PydanticObjectId(customer_id))
    if not customer:
        raise NotFoundException(f"Customer with ID {customer_id} not found.")
    return customer

async def update_customer(customer_id: str, customer_data: CustomerUpdate) -> Customer:
    """Updates an existing customer."""
    customer = await get_customer_by_id(customer_id)
    
    # Check for duplicate RUC if it's being changed
    if customer_data.ruc and customer.ruc != customer_data.ruc:
        existing = await Customer.find_one(Customer.ruc == customer_data.ruc)
        if existing and existing.id != customer.id:
            raise DuplicateException(f"Another customer with RUC {customer_data.ruc} already exists.")

    # Update fields
    update_data = customer_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
    
    await customer.save()
    return customer

async def delete_customer(customer_id: str) -> bool:
    """Deletes a customer by their ID."""
    customer = await get_customer_by_id(customer_id)
    await customer.delete()
    return True

# ================================================
# ================ SALES ORDERS ==================
# ================================================

async def get_sales_orders(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[SalesOrder]:
    """Retrieves a paginated list of sales orders."""
    query_conditions = []
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_conditions.append(
            {"$or": [
                {"order_number": search_regex},
                {"customer_id": search_regex} # This assumes customer_id is a searchable string
            ]}
        )

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await SalesOrder.find(query).count()
    items = await SalesOrder.find(query).sort("-date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=math.ceil(skip / limit) + 1 if limit > 0 else 1,
        pages=math.ceil(total / limit) if limit > 0 else 1,
        size=limit
    )

# ================================================
# ================ SALES INVOICES ================
# ================================================

async def get_sales_invoices(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[SalesInvoice]:
    """Retrieves a paginated list of sales invoices."""
    query_conditions = []
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_conditions.append(
            {"$or": [
                {"invoice_number": search_regex},
                {"order_id": search_regex} # This assumes order_id is a searchable string
            ]}
        )

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await SalesInvoice.find(query).count()
    items = await SalesInvoice.find(query).sort("-invoice_date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=math.ceil(skip / limit) + 1 if limit > 0 else 1,
        pages=math.ceil(total / limit) if limit > 0 else 1,
        size=limit
    )

# ================================================
# ================ CREDIT NOTES ==================
# ================================================

async def get_credit_notes(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[CreditNote]:
    """Retrieves a paginated list of credit notes."""
    query_conditions = []
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_conditions.append(
            {"$or": [
                {"credit_note_number": search_regex},
                {"invoice_id": search_regex}
            ]}
        )

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await CreditNote.find(query).count()
    items = await CreditNote.find(query).sort("-date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=math.ceil(skip / limit) + 1 if limit > 0 else 1,
        pages=math.ceil(total / limit) if limit > 0 else 1,
        size=limit
    )
