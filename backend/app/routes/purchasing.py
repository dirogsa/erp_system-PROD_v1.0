from fastapi import APIRouter, HTTPException, Depends
from typing import List

# Importa el nuevo servicio de numeración
from app.services.document_number_service import get_next_document_number

# Modelos de Purchasing
from app.models.purchasing import Order, Invoice, Supplier, OrderDetail, OrderStatus
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

# --- Rutas para Órdenes de Compra (Orders) ---
@router.post("/orders/", response_model=Order)
async def create_purchase_order(order: Order):
    # Lógica de numeración automática
    order.order_number = await get_next_document_number("OC", Order)
    await order.insert()
    return order

@router.get("/orders/", response_model=List[Order])
async def list_purchase_orders():
    return await Order.find_all().to_list()

@router.post("/orders/{order_id}/receive", response_model=Order)
async def receive_purchase_order(order_id: str):
    """
    Recibe la mercancía de una orden de compra, actualizando el stock.
    """
    # 1. Buscar la orden de compra
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 2. Verificar que no haya sido recibida antes
    if order.status == OrderStatus.RECEIVED:
        raise HTTPException(status_code=400, detail="Order has already been received")

    # 3. Iterar y crear movimientos de stock
    for item in order.items:
        # Buscar el producto para asegurar que existe
        product = await Product.find_one({"sku": item.product_sku})
        if not product:
            raise HTTPException(
                status_code=404, 
                detail=f"Product with SKU {item.product_sku} not found. Cannot receive order."
            )
        
        # Crear el movimiento de stock (INGRESO)
        movement = StockMovement(
            product_sku=item.product_sku,
            quantity=item.quantity,
            movement_type=MovementType.IN,
            reference_document=f"PO-{order.order_number}" # Referencia a la orden de compra
        )
        
        # La lógica de actualización de stock ya está en el evento de inserción del movimiento
        # Disparado desde la ruta de /stock-movements, así que debemos replicarlo aquí.
        product.stock_current += movement.quantity
        
        await movement.insert()
        await product.save()

    # 4. Actualizar el estado de la orden
    order.status = OrderStatus.RECEIVED
    await order.save()

    return order


# --- Rutas para Facturas de Compra (Invoices) ---
@router.post("/invoices/", response_model=Invoice)
async def create_purchase_invoice(invoice: Invoice):
    # Lógica de numeración automática
    invoice.invoice_number = await get_next_document_number("FC", Invoice)
    await invoice.insert()
    return invoice

@router.get("/invoices/", response_model=List[Invoice])
async def list_purchase_invoices():
    return await Invoice.find_all().to_list()
