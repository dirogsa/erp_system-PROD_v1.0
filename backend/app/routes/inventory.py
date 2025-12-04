from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from datetime import datetime

# Importa los modelos y servicios necesarios
from app.models.inventory import Product, Category, Warehouse, StockMovement
from app.schemas.inventory_schemas import ProductCreate, PaginatedProducts, PaginatedStockMovements
from app.schemas.common import PaginatedResponse
from app.services import inventory_service
from app.exceptions.business_exceptions import NotFoundException, DuplicateException

router = APIRouter(tags=["Inventory"])

# --- Rutas para Productos (Products) ---

@router.post("/products/", response_model=Product)
async def create_product_route(product_data: ProductCreate):
    try:
        return await inventory_service.create_product(
            Product(**product_data.dict(exclude={"stock_initial"})),
            product_data.stock_initial
        )
    except DuplicateException as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.get("/products/", response_model=PaginatedResponse[Product])
async def list_products_route(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = Query("sku", alias="sort_by"), # CORREGIDO
    sort_order: Optional[str] = Query("asc", alias="sort_order") # CORREGIDO
):
    """
    Endpoint para listar productos de forma paginada, con búsqueda y ordenación.
    """
    skip = (page - 1) * limit
    # CORREGIDO: Pasar los parámetros de ordenación al servicio
    paginated_result = await inventory_service.get_products(
        skip=skip, 
        limit=limit, 
        search=search, 
        category=category, 
        sort_by=sort_by, 
        sort_order=sort_order
    )
    return paginated_result

@router.get("/products/{sku}", response_model=Product)
async def get_product_route(sku: str):
    try:
        return await inventory_service.get_product_by_sku(sku)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/products/{sku}", response_model=Product)
async def update_product_route(sku: str, product_data: Product):
    try:
        return await inventory_service.update_product(sku, product_data)
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/products/{sku}", status_code=204)
async def delete_product_route(sku: str):
    try:
        success = await inventory_service.delete_product(sku)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete product")
        return None
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))

# --- Rutas para Almacenes (Warehouses) ---
@router.get("/warehouses/", response_model=List[Warehouse])
async def list_warehouses():
    return await Warehouse.find_all().to_list()

# --- Rutas para Movimientos de Stock (StockMovements) ---

@router.get("/stock-movements/", response_model=PaginatedStockMovements)
async def list_stock_movements(
    product_sku: Optional[str] = None,
    page: int = 1,
    limit: int = 10
):
    query = {}
    if product_sku:
        query["product_sku"] = {"$regex": product_sku, "$options": "i"}

    skip = (page - 1) * limit
    movements_cursor = StockMovement.find(query).sort(-StockMovement.created_at).skip(skip).limit(limit)
    movements = await movements_cursor.to_list()
    
    total = await StockMovement.find(query).count()
    
    return {"items": jsonable_encoder(movements), "total": total}

@router.get("/stock-movements/product/{product_sku}/history", response_model=PaginatedStockMovements)
async def get_stock_movements_for_product(
    product_sku: str,
    page: int = 1,
    limit: int = 5,
):
    query = {"product_sku": product_sku}
    skip = (page - 1) * limit
    movements_cursor = StockMovement.find(query).sort(-StockMovement.created_at).skip(skip).limit(limit)
    movements = await movements_cursor.to_list()
    total = await StockMovement.find(query).count()
    return {"items": jsonable_encoder(movements), "total": total}

# ... (otras rutas de categorías, almacenes, etc. se mantienen igual)
