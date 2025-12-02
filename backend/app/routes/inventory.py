from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

# Importa los modelos y el tipo de movimiento
from app.models.inventory import Product, Category, Warehouse, StockMovement, MovementType

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])

# --- Rutas para Productos (Products) ---
@router.post("/products/", response_model=Product)
async def create_product(product: Product):
    await product.insert()
    return product

@router.get("/products/", response_model=List[Product])
async def list_products(sku: Optional[str] = None, name: Optional[str] = None):
    query = {}
    if sku:
        query["sku"] = {"$regex": sku, "$options": "i"}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    return await Product.find(query).to_list()

@router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

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
    # Lógica para actualizar el stock_current del producto
    product = await Product.find_one({"sku": movement.product_sku})
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU {movement.product_sku} not found")

    # Determinar si es un ingreso o una salida
    # Los tipos que empiezan con 'LOSS' o son 'OUT' se consideran salidas.
    if movement.movement_type.value.startswith('LOSS') or movement.movement_type == MovementType.OUT:
        product.stock_current -= movement.quantity
    # Los demás tipos ('IN', 'ADJUSTMENT', etc.) se consideran ingresos.
    else:
        product.stock_current += movement.quantity

    # Guardar el movimiento y la actualización del producto
    await movement.insert()
    await product.save()
    
    return movement

@router.get("/stock-movements/", response_model=List[StockMovement])
async def list_stock_movements(product_sku: Optional[str] = None):
    query = {}
    if product_sku:
        query["product_sku"] = product_sku
    return await StockMovement.find(query).to_list()
