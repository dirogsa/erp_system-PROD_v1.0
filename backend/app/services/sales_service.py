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
from app.exceptions.business_exceptions import NotFoundException, ValidationException, DuplicateEntityException
from app.schemas.common import PaginatedResponse
from app.schemas.sales_schemas import CreditNoteCreate
import math

# ================================================
# =============== CUSTOMERS ======================
# ================================================

async def get_customers(
    skip: int = 0, limit: int = 10, search: Optional[str] = None
) -> PaginatedResponse[Customer]:
    """Retrieves a paginated list of customers."""
    query_conditions = []
    if search:
        query_conditions.append(Customer.name.contains(search, case_sensitive=False))

    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await Customer.find(query).count()
    items = await Customer.find(query).sort("+name").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

# ================================================
# ================ SALES ORDERS ==================
# ================================================

async def get_orders(
    skip: int = 0, limit: int = 50, search: Optional[str] = None, 
    status: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None
) -> PaginatedResponse[SalesOrder]:
    """Retrieves a paginated list of sales orders."""
    query_conditions = []
    if search:
        query_conditions.append(SalesOrder.order_number.contains(search, case_sensitive=False))
    if status:
        query_conditions.append(SalesOrder.status == status)
    if date_from:
        query_conditions.append(SalesOrder.date >= datetime.fromisoformat(date_from))
    if date_to:
        query_conditions.append(SalesOrder.date <= datetime.fromisoformat(date_to))
    
    query = {"$and": query_conditions} if query_conditions else {}
    
    total = await SalesOrder.find(query).count()
    items = await SalesOrder.find(query).sort("-date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

# ================================================
# =============== SALES INVOICES =================
# ================================================

async def get_invoices(
    skip: int = 0, limit: int = 50, search: Optional[str] = None, 
    payment_status: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None
) -> PaginatedResponse[SalesInvoice]:
    """Retrieves a paginated list of sales invoices."""
    query_conditions = []
    if search:
        query_conditions.append(SalesInvoice.invoice_number.contains(search, case_sensitive=False))
    if payment_status:
        query_conditions.append(SalesInvoice.payment_status == payment_status)
    if date_from:
        query_conditions.append(SalesInvoice.invoice_date >= datetime.fromisoformat(date_from))
    if date_to:
        query_conditions.append(SalesInvoice.invoice_date <= datetime.fromisoformat(date_to))

    query = {"$and": query_conditions} if query_conditions else {}

    total = await SalesInvoice.find(query).count()
    items = await SalesInvoice.find(query).sort("-invoice_date").skip(skip).limit(limit).to_list()

    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )

async def get_invoice(invoice_id: PydanticObjectId) -> SalesInvoice:
    """Retrieves a single sales invoice by its ID."""
    invoice = await SalesInvoice.get(invoice_id)
    if not invoice:
        raise NotFoundException(f"Sales invoice with ID {invoice_id} not found.")
    return invoice

# ================================================
# =============== CREDIT NOTES ===================
# ================================================

async def create_credit_note(invoice_id: PydanticObjectId, credit_note_data: CreditNoteCreate) -> CreditNote:
    """Creates a credit note for a specific sales invoice."""
    invoice = await get_invoice(invoice_id)

    credit_note_total = sum(item.quantity * item.unit_price for item in credit_note_data.items)
    invoice_balance = invoice.total_amount - invoice.amount_paid - invoice.credit_applied

    if credit_note_total > invoice_balance:
        raise ValidationException(f"Credit note total ({credit_note_total:.2f}) cannot exceed the outstanding invoice balance ({invoice_balance:.2f}).")

    # Further validation (e.g., check item quantities against invoiced quantities) can be added here

    credit_note_number = await get_credit_note_number()
    
    new_credit_note = CreditNote(
        credit_note_number=credit_note_number,
        sales_invoice_id=str(invoice_id),
        customer_id=invoice.customer_id,
        date=credit_note_data.date,
        reason=credit_note_data.reason,
        items=[CreditNoteItem(**item.model_dump()) for item in credit_note_data.items],
        total_amount=credit_note_total,
        notes=credit_note_data.notes
    )
    await new_credit_note.insert()

    # Update invoice
    invoice.credit_applied += credit_note_total
    invoice.credit_note_ids.append(str(new_credit_note.id))
    if invoice.credit_applied >= invoice.total_amount - invoice.amount_paid:
        invoice.payment_status = PaymentStatus.PAID
    else:
        invoice.payment_status = PaymentStatus.PARTIAL
    await invoice.save()

    # If the reason is a return, create a stock movement
    if credit_note_data.reason == CreditNoteReason.RETURN:
        for item in new_credit_note.items:
            await inventory_service.create_stock_movement(
                movement_type=MovementType.SALE_RETURN,
                product_sku=item.product_sku,
                quantity=item.quantity,
                warehouse_id=None, # Define logic to get warehouse
                notes=f"Return for Credit Note {credit_note_number}"
            )

    return new_credit_note

async def get_credit_notes(
    skip: int = 0, limit: int = 50, search: Optional[str] = None
) -> PaginatedResponse[CreditNote]:
    """Retrieves a paginated list of credit notes."""
    query_conditions = []
    if search:
        query_conditions.append(CreditNote.credit_note_number.contains(search, case_sensitive=False))
    
    query = {"$and": query_conditions} if query_conditions else {}

    total = await CreditNote.find(query).count()
    items = await CreditNote.find(query).sort("-date").skip(skip).limit(limit).to_list()

    return PaginatedResponse(
        items=items,
        total=total,
        page=(skip // limit) + 1,
        pages=math.ceil(total / limit) if limit > 0 else 0,
        size=limit
    )
