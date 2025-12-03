from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from beanie import PydanticObjectId

from app.services import sales_service
from app.schemas.sales_schemas import (
    CreditNoteCreate, CreditNoteResponse, SalesOrderOut, SalesInvoiceOut, Customer
)
from app.schemas.common import PaginatedResponse
from app.exceptions.business_exceptions import NotFoundException, ValidationException

router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])

# --- Rutas para Clientes (Customers) ---

@router.get("/customers", response_model=PaginatedResponse[Customer])
async def list_customers(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Search by customer name"),
):
    """
    Retrieves a paginated list of customers.
    """
    try:
        skip = (page - 1) * limit
        paginated_result = await sales_service.get_customers(
            skip=skip, limit=limit, search=search
        )
        return paginated_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- Rutas para Órdenes de Venta (Sales Orders) ---

@router.get("/orders/", response_model=PaginatedResponse[SalesOrderOut])
async def list_sales_orders(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    skip = (page - 1) * limit
    paginated_result = await sales_service.get_orders(
        skip=skip, limit=limit, search=search, status=status, date_from=date_from, date_to=date_to
    )
    return paginated_result

# --- Rutas para Facturas de Venta (Sales Invoices) ---

@router.get("/invoices/", response_model=PaginatedResponse[SalesInvoiceOut])
async def list_sales_invoices(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    payment_status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    skip = (page - 1) * limit
    paginated_result = await sales_service.get_invoices(
        skip=skip, limit=limit, search=search, payment_status=payment_status, date_from=date_from, date_to=date_to
    )
    return paginated_result

# --- Rutas para Notas de Crédito (Credit Notes) ---

@router.post("/invoices/{invoice_id}/credit-notes/", response_model=CreditNoteResponse)
async def create_credit_note_for_invoice(
    invoice_id: PydanticObjectId, 
    credit_note_in: CreditNoteCreate
):
    # ... (logic as before)
    pass

@router.get("/credit-notes/", response_model=PaginatedResponse[CreditNoteResponse])
async def list_credit_notes(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = Query(None, description="Search by credit note number")
):
    skip = (page - 1) * limit
    paginated_result = await sales_service.get_credit_notes(
        skip=skip, limit=limit, search=search
    )
    return paginated_result
