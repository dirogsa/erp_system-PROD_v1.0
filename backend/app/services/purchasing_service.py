from typing import List, Optional, Dict, Any
from datetime import datetime
from beanie import PydanticObjectId
from app.models.purchasing import PurchaseOrder, PurchaseInvoice, Supplier, PaymentStatus, OrderStatus, Payment
from app.models.inventory import DeliveryGuide, GuideType, GuideStatus, GuideItem, MovementType, Product
from app.services import inventory_service
from app.exceptions.business_exceptions import NotFoundException, ValidationException, DuplicateEntityException
from app.schemas.common import PaginatedResponse

# ==================== ORDERS ====================

async def get_orders(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> PaginatedResponse[PurchaseOrder]:
    query = {}
    
    if search:
        query["$or"] = [
            {"order_number": {"$regex": search, "$options": "i"}},
            {"supplier_name": {"$regex": search, "$options": "i"}}
        ]
    
    if status:
        query["status"] = status
        
    if date_from or date_to:
        query["date"] = {}
        if date_from:
            query["date"]["$gte"] = datetime.fromisoformat(date_from)
        if date_to:
            query["date"]["$lte"] = datetime.fromisoformat(date_to)

    total = await PurchaseOrder.find(query).count()
    items = await PurchaseOrder.find(query).sort("-date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        pages=(total + limit - 1) // limit,
        size=limit
    )

async def create_order(order: PurchaseOrder) -> PurchaseOrder:
    # Generate sequential order number
    last_order = await PurchaseOrder.find_all().sort("-order_number").limit(1).to_list()
    
    if last_order and last_order[0].order_number:
        try:
            last_num = int(last_order[0].order_number.split('-')[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1
    else:
        new_num = 1
    
    order.order_number = f"ORD-{new_num:04d}"
    order.total_amount = round(sum(item.quantity * item.unit_cost for item in order.items), 3)
    
    await order.insert()
    return order

# ==================== INVOICES ====================

async def get_invoices(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    payment_status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> PaginatedResponse[PurchaseInvoice]:
    query = {}
    
    if search:
        query["$or"] = [
            {"invoice_number": {"$regex": search, "$options": "i"}},
            {"supplier_name": {"$regex": search, "$options": "i"}},
            {"order_number": {"$regex": search, "$options": "i"}}
        ]
    
    if payment_status:
        query["payment_status"] = payment_status
        
    if date_from or date_to:
        query["invoice_date"] = {}
        if date_from:
            query["invoice_date"]["$gte"] = datetime.fromisoformat(date_from)
        if date_to:
            query["invoice_date"]["$lte"] = datetime.fromisoformat(date_to)

    total = await PurchaseInvoice.find(query).count()
    items = await PurchaseInvoice.find(query).sort("-invoice_date").skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        pages=(total + limit - 1) // limit,
        size=limit
    )

async def get_invoice(invoice_number: str) -> PurchaseInvoice:
    invoice = await PurchaseInvoice.find_one(PurchaseInvoice.invoice_number == invoice_number)
    if not invoice:
        raise NotFoundException("Invoice", invoice_number)
    return invoice

async def create_invoice(
    order_number: str, 
    invoice_number: str, 
    invoice_date: str, 
    payment_status: PaymentStatus = PaymentStatus.PENDING,
    amount_paid: float = 0.0,
    payment_date: Optional[str] = None
) -> PurchaseInvoice:
    
    order = await PurchaseOrder.find_one(PurchaseOrder.order_number == order_number)
    if not order:
        raise NotFoundException("Order", order_number)
    
    if order.status == OrderStatus.INVOICED:
        raise ValidationException("Order already invoiced")
    
    if amount_paid > order.total_amount:
        raise ValidationException("Amount paid cannot exceed total amount")
    
    invoice = PurchaseInvoice(
        invoice_number=invoice_number,
        order_number=order.order_number,
        supplier_name=order.supplier_name,
        invoice_date=datetime.fromisoformat(invoice_date),
        items=order.items,
        total_amount=order.total_amount,
        payment_status=payment_status,
        amount_paid=round(amount_paid, 3)
    )
    
    if amount_paid > 0 and payment_date:
        payment = Payment(
            amount=round(amount_paid, 3),
            date=datetime.fromisoformat(payment_date),
            notes="Pago inicial al registrar factura"
        )
        invoice.payments.append(payment)
    
    await invoice.insert()
    
    order.status = OrderStatus.INVOICED
    await order.save()
    
    return invoice

# ==================== PAYMENTS ====================

async def register_payment(invoice_number: str, amount: float, payment_date: str, notes: str = None) -> Dict[str, Any]:
    invoice = await get_invoice(invoice_number)
    
    if invoice.payment_status == PaymentStatus.PAID:
        raise ValidationException("Invoice already fully paid")
    
    pending = invoice.total_amount - invoice.amount_paid
    if amount > pending:
        raise ValidationException(f"Payment amount exceeds pending amount (S/ {pending:.2f})")
    
    payment = Payment(
        amount=amount,
        date=datetime.fromisoformat(payment_date),
        notes=notes
    )
    invoice.payments.append(payment)
    invoice.amount_paid += amount
    
    if invoice.amount_paid >= invoice.total_amount:
        invoice.payment_status = PaymentStatus.PAID
    elif invoice.amount_paid > 0:
        invoice.payment_status = PaymentStatus.PARTIAL
    
    await invoice.save()
    return {"message": "Payment registered successfully", "invoice": invoice}

# ==================== SUPPLIERS ====================

async def get_suppliers() -> List[Supplier]:
    return await Supplier.find_all().to_list()

async def create_supplier(supplier: Supplier) -> Supplier:
    await supplier.insert()
    return supplier

async def update_supplier(id: PydanticObjectId, supplier_data: Supplier) -> Supplier:
    supplier = await Supplier.get(id)
    if not supplier:
        raise NotFoundException("Supplier", str(id))
    
    supplier.name = supplier_data.name
    supplier.email = supplier_data.email
    supplier.phone = supplier_data.phone
    supplier.address = supplier_data.address
    
    await supplier.save()
    return supplier

async def delete_supplier(id: PydanticObjectId) -> bool:
    supplier = await Supplier.get(id)
    if not supplier:
        raise NotFoundException("Supplier", str(id))
    await supplier.delete()
    return True

# ==================== RECEPTION ====================

async def create_reception_guide(invoice_number: str, notes: str, created_by: str) -> Dict[str, Any]:
    invoice = await PurchaseInvoice.find_one(PurchaseInvoice.invoice_number == invoice_number)
    if not invoice:
        raise NotFoundException("Invoice", invoice_number)
    
    if invoice.reception_status == "RECEIVED":
        raise ValidationException("Invoice already received")
    
    guide_number = f"GUIA-REC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    guide_items = []
    for item in invoice.items:
        product = await inventory_service.get_product_by_sku(item.product_sku)
        
        guide_items.append(GuideItem(
            sku=item.product_sku,
            product_name=product.name,
            quantity=item.quantity,
            unit_cost=item.unit_cost
        ))
    
    guide = DeliveryGuide(
        guide_number=guide_number,
        guide_type=GuideType.RECEPTION,
        status=GuideStatus.COMPLETED,
        invoice_id=invoice_number,
        target="Almacén Principal",
        items=guide_items,
        notes=notes,
        created_by=created_by,
        completed_date=datetime.now()
    )
    await guide.insert()
    
    # Move Inventory (IN) and update weighted average cost
    for item in invoice.items:
        await inventory_service.register_movement(
            sku=item.product_sku,
            quantity=item.quantity,
            movement_type=MovementType.IN,
            reference=guide_number,
            unit_cost=item.unit_cost
        )
    
    invoice.reception_status = "RECEIVED"
    invoice.guide_id = str(guide.id)
    await invoice.save()
    
    return {
        "message": "Reception guide created successfully",
        "guide_number": guide_number,
        "items_count": len(guide_items)
    }
