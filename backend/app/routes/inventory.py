from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from datetime import datetime

# Importa los modelos y el tipo de movimiento
from app.models.inventory import Product, Category, Warehouse, StockMovement, MovementType
from app.schemas.inventory_schemas import PaginatedProducts, ProductCreate, PaginatedStockMovements

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

# RUTA DE PRUEBA
@router.get("/test-gemini/")
async def test_gemini_route():
    return {"message": "Gemini test route is working correctly!"}


# --- Rutas para Productos (Products) ---
@router.post("/products/", response_model=Product)
async def create_product(product_data: ProductCreate):
    # Crea una instancia del producto, pero sin guardarla aún
    product = Product(**product_data.dict(exclude={"stock_initial"}))

    # Asigna el stock inicial al stock current
    product.stock_current = product_data.stock_initial

    # Guarda el producto en la base de datos
    await product.insert()

    # Si hay un stock inicial, crea el movimiento de inventario correspondiente
    if product_data.stock_initial > 0:
        movement = StockMovement(
            product_sku=product.sku,
            quantity=product_data.stock_initial,
            movement_type=MovementType.ADJUSTMENT,
            notes="Stock inicial",
            created_at=datetime.utcnow(),
            reference_document="N/A"
        )
        await movement.insert()

    return product

@router.get("/products/", response_model=PaginatedProducts)
async def list_products(
    sku: Optional[str] = None, 
    name: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
):
    query = {}
    if sku:
        query["sku"] = {"$regex": sku, "$options": "i"}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}

    # Calcula el número de documentos a omitir
    skip = (page - 1) * limit

    # Realiza la consulta paginada
    products_cursor = Product.find(query).skip(skip).limit(limit)
    products = await products_cursor.to_list()

    # Obtiene el total de documentos que coinciden con la consulta
    total = await Product.find(query).count()

    # Devuelve el resultado en el formato esperado
    return {"items": jsonable_encoder(products), "total": total}

@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# --- RUTA CORREGIDA --- #
@router.put("/products/{sku}", response_model=Product)
async def update_product(sku: str, product_data: Product):
    update_data = product_data.dict(exclude_unset=True, exclude={"id"})
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    db_product = await Product.find_one({"sku": sku})
    if not db_product:
        raise HTTPException(status_code=404, detail=f"Product with SKU {sku} not found")
    
    await db_product.update({"$set": update_data})
    
    # Devuelve el documento actualizado
    updated_doc = await Product.find_one({"sku": sku})
    return updated_doc

# --- RUTA CORREGIDA --- #
@router.delete("/products/{sku}", status_code=204)
async def delete_product(sku: str):
    product = await Product.find_one({"sku": sku})
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU {sku} not found")
    await product.delete()
    return None

# --- Rutas para Importar/Exportar --- 
@router.get("/products/export/json", response_model=List[Product])
async def export_products():
    return await Product.find_all().to_list()

@router.post("/products/import/json")
async def import_products(products: List[Product]):
    created_count = 0
    for product in products:
        existing_product = await Product.find_one({"sku": product.sku})
        if not existing_product:
            await product.insert()
            created_count += 1
    return {"message": f"Successfully imported {created_count} new products."}

# --- Rutas para Categorías (Categories) ---
@router.post("/categories/", response_model=Category)
async def create_category(category: Category):
    await category.insert()
    return category

@router.get("/categories/", response_model=List[Category])
async def list_categories():
    return await Category.find_all().to_list()

# --- Rutas para Almacenes (Warehouses) ---
@router.post("/warehouses/", response_model=Warehouse)
async def create_warehouse(warehouse: Warehouse):
    await warehouse.insert()
    return warehouse

@router.get("/warehouses/", response_model=List[Warehouse])
async def list_warehouses():
    return await Warehouse.find_all().to_list()

# --- Rutas para Movimientos de Stock (StockMovements) ---
@router.post("/stock-movements/", response_model=StockMovement)
async def create_stock_movement(movement: StockMovement):
    product = await Product.find_one({"sku": movement.product_sku})
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU {movement.product_sku} not found")
    if movement.movement_type.value.startswith('LOSS') or movement.movement_type == MovementType.OUT:
        product.stock_current -= movement.quantity
    else:
        product.stock_current += movement.quantity
    await movement.insert()
    await product.save()
    return movement

@router.get("/stock-movements/product/{product_sku}/history", response_model=PaginatedStockMovements)
async def get_stock_movements_for_product(
    product_sku: str,
    page: int = 1,
    limit: int = 5,
):
    """
    Retrieves a paginated history of stock movements for a specific product.
    """
    query = {"product_sku": product_sku}
    
    skip = (page - 1) * limit
    
    movements_cursor = StockMovement.find(query).sort(-StockMovement.created_at).skip(skip).limit(limit)
    movements = await movements_cursor.to_list()
    
    # Get the total count of movements for the given product
    total = await StockMovement.find(query).count()
    
    return {"items": jsonable_encoder(movements), "total": total}


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
