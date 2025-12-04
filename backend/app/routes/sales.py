from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from beanie import PydanticObjectId
from app.services.sales_service import (
    get_sales_orders, 
    get_sales_invoices,
    create_customer,
    get_customers,
    get_customer_by_id,
    update_customer,
    delete_customer,
    get_credit_notes
)
from app.schemas.sales_schemas import SalesOrderRead, SalesInvoiceRead, CustomerCreate, CustomerUpdate, CustomerRead, CreditNoteRead
from app.schemas.common import PaginatedResponse

router = APIRouter()

# ================================================
# =============== CUSTOMERS ======================
# ================================================

@router.post("/customers/", response_model=CustomerRead, status_code=201)
async def add_customer(customer_data: CustomerCreate):
    return await create_customer(customer_data)

@router.get("/customers/", response_model=PaginatedResponse[CustomerRead])
async def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    return await get_customers(skip=skip, limit=limit, search=search)

@router.get("/customers/{customer_id}", response_model=CustomerRead)
async def retrieve_customer(customer_id: str):
    return await get_customer_by_id(customer_id)

@router.put("/customers/{customer_id}", response_model=CustomerRead)
async def edit_customer(customer_id: str, customer_data: CustomerUpdate):
    return await update_customer(customer_id, customer_data)

@router.delete("/customers/{customer_id}", status_code=204)
async def remove_customer(customer_id: str):
    if not await delete_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return {}

# ================================================
# ================ SALES ORDERS ==================
# ================================================

@router.get("/orders/", response_model=PaginatedResponse[SalesOrderRead])
async def list_sales_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    """List sales orders with pagination and search."""
    orders_response = await get_sales_orders(skip=skip, limit=limit, search=search)
    return orders_response

# ================================================
# ================ SALES INVOICES ================
# ================================================

@router.get("/invoices/", response_model=PaginatedResponse[SalesInvoiceRead])
async def list_sales_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    """List sales invoices with pagination and search."""
    invoices_response = await get_sales_invoices(skip=skip, limit=limit, search=search)
    return invoices_response

# ================================================
# ================= CREDIT NOTES =================
# ================================================

@router.get("/credit-notes/", response_model=PaginatedResponse[CreditNoteRead])
async def list_credit_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    """List credit notes with pagination and search."""
    credit_notes_response = await get_credit_notes(skip=skip, limit=limit, search=search)
    return credit_notes_response
