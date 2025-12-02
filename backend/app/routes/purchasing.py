from fastapi import APIRouter, HTTPException, Depends
from typing import List

# Importa el nuevo servicio de numeración
from app.services.document_number_service import get_next_document_number

# Modelos de Purchasing (añadimos PaymentStatus)
from app.models.purchasing import Order, Invoice, Supplier, OrderDetail, OrderStatus, PaymentStatus
# Modelos de Inventory para mover stock
from app.models.inventory import Product, StockMovement, MovementType

router = APIRouter(prefix="/api/v1/purchasing", tags=["Purchasing"])

# --- Rutas para Proveedores (Suppliers) ---
@router.post("/suppliers/", response_model=Supplier)
async def create_supplier(supplier: Supplier):
    await supplier.insert()
    return supplier

@router.get("/suppliers/", response_model=List[Supplier])
async def list_suppliers():
    return await Supplier.find_all().to_list()

# --- ¡NUEVA RUTA AÑADIDA! ---
@router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier: Supplier):
    """
    Actualiza los datos de un proveedor existente.
    """
    update_data = supplier.dict(exclude_unset=True, exclude={"id"})

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    db_supplier = await Supplier.get(supplier_id)
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    await db_supplier.update({"$set": update_data})
    
    updated_doc = await Supplier.get(supplier_id)
    return updated_doc

# --- Rutas para Órdenes de Compra (Orders) ---
@router.post("/orders/", response_model=Order)
async def create_purchase_order(order: Order):
    order.order_number = await get_next_document_number("OC", Order)
    await order.insert()
    return order

@router.get("/orders/", response_model=List[Order])
async def list_purchase_orders():
    return await Order.find_all().to_list()

@router.post("/orders/{order_id}/receive", response_model=Order)
async def receive_purchase_order(order_id: str):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == OrderStatus.RECEIVED:
        raise HTTPException(status_code=400, detail="Order has already been received")

    for item in order.items:
        product = await Product.find_one({"sku": item.product_sku})
        if not product:
            raise HTTPException(
                status_code=404, 
                detail=f"Product with SKU {item.product_sku} not found. Cannot receive order."
            )
        
        movement = StockMovement(
            product_sku=item.product_sku,
            quantity=item.quantity,
            movement_type=MovementType.IN,
            reference_document=f"PO-{order.order_number}"
        )
        
        product.stock_current += movement.quantity
        
        await movement.insert()
        await product.save()

    order.status = OrderStatus.RECEIVED
    await order.save()

    return order

# --- Rutas para Facturas de Compra (Invoices) ---
@router.post("/invoices/", response_model=Invoice)
async def create_purchase_invoice(invoice: Invoice):
    invoice.invoice_number = await get_next_document_number("FC", Invoice)
    await invoice.insert()
    return invoice

@router.get("/invoices/", response_model=List[Invoice])
async def list_purchase_invoices():
    return await Invoice.find_all().to_list()

@router.post("/invoices/{invoice_id}/pay", response_model=Invoice)
async def record_purchase_payment(invoice_id: str):
    invoice = await Invoice.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.payment_status == PaymentStatus.PAID:
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    invoice.payment_status = PaymentStatus.PAID
    await invoice.save()
    return invoice
