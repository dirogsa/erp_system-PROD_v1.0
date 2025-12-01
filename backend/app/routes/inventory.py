from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional
from pydantic import BaseModel
from app.models.inventory import Product, Warehouse, MovementType
from app.services import inventory_service
from app.schemas.inventory_schemas import LossRegistration, TransferRequest, ProductSearchRequest
import csv
import io

router = APIRouter(prefix="/inventory", tags=["Inventory"])

# Pydantic model for inventory adjustment request
class InventoryAdjustmentRequest(BaseModel):
    product_sku: str
    quantity_adjusted: int
    reason: str
    responsible: Optional[str] = None


from app.schemas.common import PaginatedResponse

@router.get("/products", response_model=PaginatedResponse[Product])
async def get_products(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None, 
    category: Optional[str] = None
):
    return await inventory_service.get_products(skip, limit, search, category)


@router.post("/products/search", response_model=PaginatedResponse[Product])
async def search_products(payload: ProductSearchRequest):
    """Search products by measurement filters and free text."""
    query_clauses = []

    if payload.search:
        query_clauses.append({
            "$or": [
                {"name": {"$regex": payload.search, "$options": "i"}},
                {"sku": {"$regex": payload.search, "$options": "i"}}
            ]
        })

    if payload.measurementFilters:
        for f in payload.measurementFilters:
            # Build elemMatch for each filter
            elem = {"label": f.label, "unit": f.unit}
            value_clause = {}
            if f.min is not None:
                value_clause["$gte"] = f.min
            if f.max is not None:
                value_clause["$lte"] = f.max
            if value_clause:
                elem["value"] = value_clause

            query_clauses.append({"measurements": {"$elemMatch": elem}})

    query = {"$and": query_clauses} if query_clauses else {}

    skip = payload.skip or 0
    limit = payload.limit or 50

    total = await Product.find(query).count()
    items = await Product.find(query).skip(skip).limit(limit).to_list()

    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        pages=(total + limit - 1) // limit,
        size=limit
    )

@router.post("/products", response_model=Product)
async def create_product(product: Product, initial_stock: int = 0):
    return await inventory_service.create_product(product, initial_stock)

@router.put("/products/{sku}", response_model=Product)
async def update_product(sku: str, product_data: Product, new_stock: int = None):
    return await inventory_service.update_product(sku, product_data, new_stock)

@router.delete("/products/{sku}")
async def delete_product(sku: str):
    await inventory_service.delete_product(sku)
    return {"message": "Product deleted successfully"}

@router.get("/warehouses", response_model=List[Warehouse])
async def get_warehouses():
    return await inventory_service.get_warehouses()


# --- Feature Endpoints ---

@router.post("/adjustments", response_model=Product)
async def create_inventory_adjustment(request: InventoryAdjustmentRequest):
    """Creates a new inventory adjustment."""
    return await inventory_service.create_inventory_adjustment(
        sku=request.product_sku,
        quantity_adjusted=request.quantity_adjusted,
        reason=request.reason,
        responsible=request.responsible
    )


@router.post("/losses")
async def register_loss(loss_data: LossRegistration):
    return await inventory_service.register_loss(
        loss_data.sku,
        loss_data.quantity,
        loss_data.loss_type,
        loss_data.notes,
        loss_data.responsible
    )

@router.get("/losses/report")
async def get_losses_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    loss_type: Optional[str] = None
):
    return await inventory_service.get_losses_report(start_date, end_date, loss_type)

@router.post("/transfer-out")
async def register_transfer_out(transfer: TransferRequest):
    # Convert Pydantic models to dicts for service
    items_dict = [{"sku": item.sku, "quantity": item.quantity} for item in transfer.items]
    return await inventory_service.register_transfer_out(
        transfer.target_warehouse_id,
        items_dict,
        transfer.notes
    )

@router.post("/import")
async def import_products(file: UploadFile = File(...)):
    """Import products from CSV file with CRUD operations (INSERT/UPDATE/DELETE)"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(decoded))
    
    # Validate required columns
    required_columns = {'operation', 'sku'}
    if not required_columns.issubset(csv_reader.fieldnames):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must contain columns: {', '.join(required_columns)}"
        )
    
    # Counters and tracking
    inserted_count = 0
    updated_count = 0
    deleted_count = 0
    errors = []
    inserted_skus = []
    updated_skus = []
    deleted_skus = []
    
    for row_num, row in enumerate(csv_reader, start=2):
        try:
            operation = row.get('operation', '').upper().strip()
            sku = row.get('sku', '').strip()
            
            if not sku:
                errors.append(f"Line {row_num}: SKU is required")
                continue
            
            if operation == 'INSERT':
                product = Product(
                    sku=sku,
                    name=row['name'],
                    brand=row.get('brand'),
                    description=row.get('description'),
                    price=float(row['price']),
                    cost=float(row['cost'])
                )
                # parse measurements column if provided (format: 'A|mm|15;B|mm|20')
                meas_raw = row.get('measurements', '').strip()
                if meas_raw:
                    measurements = []
                    for part in meas_raw.split(';'):
                        if not part.strip():
                            continue
                        try:
                            lbl, unit, val = part.split('|')
                            measurements.append({
                                'label': lbl.strip(),
                                'unit': unit.strip(),
                                'value': float(val)
                            })
                        except Exception:
                            # ignore malformed segments
                            continue
                    if measurements:
                        product.measurements = measurements
                initial_stock = int(row.get('stock_current', 0))
                await inventory_service.create_product(product, initial_stock)
                inserted_count += 1
                inserted_skus.append(sku)
                
            elif operation == 'UPDATE':
                current_product = await inventory_service.get_product_by_sku(sku)
                
                if row.get('name'): current_product.name = row['name']
                if row.get('brand'): current_product.brand = row['brand']
                if row.get('description'): current_product.description = row['description']
                if row.get('price'): current_product.price = float(row['price'])
                if row.get('cost'): current_product.cost = float(row['cost'])
                # parse measurements for update as well
                meas_raw = row.get('measurements', '').strip()
                if meas_raw:
                    measurements = []
                    for part in meas_raw.split(';'):
                        if not part.strip():
                            continue
                        try:
                            lbl, unit, val = part.split('|')
                            measurements.append({
                                'label': lbl.strip(),
                                'unit': unit.strip(),
                                'value': float(val)
                            })
                        except Exception:
                            continue
                    if measurements:
                        current_product.measurements = measurements
                
                await inventory_service.update_product(sku, current_product)
                
                if row.get('stock_current'):
                    await inventory_service.adjust_stock(sku, int(row['stock_current']), "CSV Import")
                    
                updated_count += 1
                updated_skus.append(sku)
                
            elif operation == 'DELETE':
                await inventory_service.delete_product(sku)
                deleted_count += 1
                deleted_skus.append(sku)
                
        except Exception as e:
            errors.append(f"Line {row_num}: {str(e)}")
            
    return {
        "summary": {
            "inserted": inserted_count,
            "updated": updated_count,
            "deleted": deleted_count,
            "errors": len(errors)
        },
        "details": {
            "inserted": inserted_skus,
            "updated": updated_skus,
            "deleted": deleted_skus,
            "errors": errors
        }
    }

@router.get("/export")
async def export_products(template: str = "current"):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['operation', 'sku', 'name', 'brand', 'description', 'price', 'cost', 'stock_current', 'measurements'])
    
    if template == "empty":
        writer.writerow(['INSERT', 'EJEMPLO-001', 'Nombre', 'Marca', 'Desc', '100.00', '50.00', '10'])
    else:
        # Fetch all products (large limit)
        response = await inventory_service.get_products(limit=10000)
        products = response.items
        
        for product in products:
            # serialize measurements as 'A|mm|15;B|mm|20'
            measurements_str = ''
            try:
                if getattr(product, 'measurements', None):
                    parts = []
                    for m in product.measurements:
                        parts.append(f"{m.get('label')}|{m.get('unit')}|{m.get('value')}")
                    measurements_str = ';'.join(parts)
            except Exception:
                measurements_str = ''

            writer.writerow([
                'UPDATE',
                product.sku,
                product.name,
                product.brand or '',
                product.description or '',
                product.price,
                product.cost,
                product.stock_current,
                measurements_str
            ])
    
    output.seek(0)
    filename = "plantilla_productos.csv" if template == "empty" else "productos.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
