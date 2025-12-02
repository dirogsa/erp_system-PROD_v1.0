from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

# Importa el nuevo servicio de numeración
from app.services.document_number_service import get_next_document_number

# Importa los modelos con los nombres correctos
from app.models.sales import Customer, SalesOrder, SalesInvoice, SalesOrderDetail, SalesPayment

router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])

# --- Rutas para Clientes (Customers) ---
@router.post("/customers/", response_model=Customer)
async def create_customer(customer: Customer):
    await customer.insert()
    return customer

@router.get("/customers/", response_model=List[Customer])
async def list_customers():
    return await Customer.find_all().to_list()

@router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: Customer):
    update_data = customer.dict(exclude_unset=True, exclude={"id"})
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    db_customer = await Customer.get(customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    await db_customer.update({"$set": update_data})
    updated_doc = await Customer.get(customer_id)
    return updated_doc

# --- Rutas para Órdenes de Venta (Sales Orders) ---
@router.post("/sales-orders/", response_model=SalesOrder)
async def create_sales_order(order: SalesOrder):
    order.order_number = await get_next_document_number("OV", SalesOrder)
    await order.insert()
    return order

@router.get("/sales-orders/", response_model=List[SalesOrder])
async def list_sales_orders():
    return await SalesOrder.find_all().to_list()

# --- Rutas para Facturas de Venta (Sales Invoices) ---
@router.post("/sales-invoices/", response_model=SalesInvoice)
async def create_sales_invoice(invoice: SalesInvoice):
    invoice.invoice_number = await get_next_document_number("FV", SalesInvoice)
    await invoice.insert()
    return invoice

@router.get("/sales-invoices/", response_model=List[SalesInvoice])
async def list_sales_invoices():
    return await SalesInvoice.find_all().to_list()

# --- ¡NUEVA RUTA AÑADIDA! ---
@router.post("/invoices/{invoice_id}/pay", response_model=SalesInvoice)
async def record_sales_payment(invoice_id: str):
    """
    Registra el pago de una factura de venta, actualizando su estado a 'paid'.
    """
    invoice = await SalesInvoice.get(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Sales invoice not found")

    if invoice.status == 'paid':
        raise HTTPException(status_code=400, detail="Invoice is already paid")

    invoice.status = 'paid'
    invoice.payment_date = datetime.utcnow()
    
    await invoice.save()
    return invoice
