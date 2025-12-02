from fastapi import APIRouter, HTTPException
from typing import List

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

# --- Rutas para Órdenes de Venta (Sales Orders) ---
@router.post("/sales-orders/", response_model=SalesOrder)
async def create_sales_order(order: SalesOrder):
    # Lógica de numeración automática para Órdenes de Venta
    order.order_number = await get_next_document_number("OV", SalesOrder)
    await order.insert()
    return order

@router.get("/sales-orders/", response_model=List[SalesOrder])
async def list_sales_orders():
    return await SalesOrder.find_all().to_list()

# --- Rutas para Facturas de Venta (Sales Invoices) ---
@router.post("/sales-invoices/", response_model=SalesInvoice)
async def create_sales_invoice(invoice: SalesInvoice):
    # Lógica de numeración automática para Facturas de Venta
    invoice.invoice_number = await get_next_document_number("FV", SalesInvoice)
    await invoice.insert()
    return invoice

@router.get("/sales-invoices/", response_model=List[SalesInvoice])
async def list_sales_invoices():
    return await SalesInvoice.find_all().to_list()
