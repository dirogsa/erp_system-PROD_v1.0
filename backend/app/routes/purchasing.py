from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from beanie import PydanticObjectId
from datetime import date

from app.services import purchasing_service
from app.schemas.purchasing_schemas import (
    DebitNoteCreate, DebitNoteResponse, PurchaseOrder, PurchaseInvoice, Supplier
)
from app.schemas.common import PaginatedResponse
from app.exceptions.business_exceptions import NotFoundException, ValidationException

router = APIRouter(prefix="/api/v1/purchasing", tags=["Purchasing"])

# --- Rutas para Proveedores (Suppliers) ---

@router.get("/suppliers/", response_model=PaginatedResponse[Supplier])
async def list_suppliers(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Search by supplier name"),
):
    """
    Retrieves a paginated list of suppliers.
    """
    try:
        skip = (page - 1) * limit
        paginated_result = await purchasing_service.get_suppliers(
            skip=skip, limit=limit, search=search
        )
        return paginated_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- Rutas para Órdenes de Compra (Purchase Orders) ---

@router.get("/orders/", response_model=PaginatedResponse[PurchaseOrder])
async def list_purchase_orders(
    status: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None, description="Search by order number or supplier name"),
    page: int = 1,
    limit: int = 10,
):
    """
    Retrieves a paginated list of purchase orders.
    """
    try:
        skip = (page - 1) * limit
        paginated_result = await purchasing_service.get_orders(
            skip=skip,
            limit=limit,
            status=status,
            date_from=date_from,
            date_to=date_to,
            search=search,
        )
        return paginated_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


# --- Rutas para Facturas de Compra (Purchase Invoices) ---

@router.get("/invoices/", response_model=PaginatedResponse[PurchaseInvoice])
async def list_purchase_invoices(
    status: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None, description="Search by invoice number or supplier name"),
    page: int = 1,
    limit: int = 10,
):
    """
    Retrieves a paginated list of purchase invoices.
    """
    try:
        skip = (page - 1) * limit
        paginated_result = await purchasing_service.get_invoices(
            skip=skip,
            limit=limit,
            status=status,
            date_from=date_from,
            date_to=date_to,
            search=search,
        )
        return paginated_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


# --- Rutas para Notas de Débito (Debit Notes) ---

@router.post("/invoices/{invoice_id}/debit-notes/", response_model=DebitNoteResponse)
async def create_debit_note_for_invoice(
    invoice_id: PydanticObjectId,
    debit_note_in: DebitNoteCreate
):
    """
    Creates a debit note for a specific purchase invoice.
    """
    try:
        debit_note = await purchasing_service.create_debit_note(invoice_id, debit_note_in)
        response = DebitNoteResponse.parse_obj(debit_note.dict())
        return response
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@router.get("/debit-notes/", response_model=PaginatedResponse[DebitNoteResponse])
async def list_debit_notes(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Search by debit note number")
):
    """
    Retrieves a paginated list of debit notes.
    """
    try:
        skip = (page - 1) * limit
        paginated_result = await purchasing_service.get_debit_notes(skip=skip, limit=limit, search=search)
        return paginated_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
