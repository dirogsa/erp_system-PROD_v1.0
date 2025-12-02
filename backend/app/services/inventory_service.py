from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.inventory import Product, StockMovement, MovementType, Warehouse
from app.exceptions.business_exceptions import NotFoundException, ValidationException, InsufficientStockException, DuplicateEntityException

from app.schemas.common import PaginatedResponse

async def get_products(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None, 
    category: Optional[str] = None
) -> PaginatedResponse[Product]:
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}}
        ]
        
    if category:
        query["category"] = category
        
    total = await Product.find(query).count()
    items = await Product.find(query).skip(skip).limit(limit).to_list()
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=skip // limit + 1,
        pages=(total + limit - 1) // limit,
        size=limit
    )

async def get_product_by_sku(sku: str) -> Product:
    product = await Product.find_one(Product.sku == sku)
    if not product:
        raise NotFoundException("Product", sku)
    return product

async def create_product(product_data: Product, initial_stock: int = 0) -> Product:
    existing = await Product.find_one(Product.sku == product_data.sku)
    if existing:
        raise DuplicateEntityException("Product", "sku", product_data.sku)
    
    # Set initial stock
    product_data.stock_current = initial_stock
    await product_data.insert()
    
    if initial_stock > 0:
        movement = StockMovement(
            product_sku=product_data.sku,
            quantity=initial_stock,
            movement_type=MovementType.IN,
            notes="Inventario Inicial",
            date=datetime.now(),
            unit_cost=product_data.cost,
            reference_document=f"INITIAL-{product_data.sku}"
        )
        await movement.insert()
        
    return product_data

async def update_product(sku: str, update_data: Product, new_stock: int = None) -> Product:
    product = await get_product_by_sku(sku)
    
    product.name = update_data.name
    product.price = update_data.price
    product.cost = update_data.cost
    product.brand = update_data.brand
    product.description = update_data.description
    # Update measurements if provided
    if getattr(update_data, 'measurements', None) is not None:
        product.measurements = update_data.measurements
    
    await product.save()
    
    if new_stock is not None and new_stock != product.stock_current:
        product = await adjust_stock(sku, new_stock, "Ajuste desde edición de producto")
        
    return product

async def delete_product(sku: str) -> bool:
    product = await Product.find_one(Product.sku == sku)
    if not product:
        raise NotFoundException("Product", sku)
    await product.delete()
    return True

async def adjust_stock(sku: str, new_quantity: int, notes: str, movement_type: MovementType = MovementType.ADJUSTMENT) -> Product:
    product = await get_product_by_sku(sku)
    
    diff = new_quantity - product.stock_current
    if diff == 0:
        return product
        
    # Determine if it's IN or OUT based on difference if generic ADJUSTMENT is used
    if movement_type == MovementType.ADJUSTMENT:
        actual_type = MovementType.IN if diff > 0 else MovementType.OUT
    else:
        actual_type = movement_type

    movement = StockMovement(
        product_sku=sku,
        quantity=abs(diff),
        movement_type=actual_type,
        notes=notes,
        date=datetime.now(),
        unit_cost=product.cost,
        reference_document=f"ADJUST-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    await movement.insert()
    
    product.stock_current = new_quantity
    await product.save()
    
    return product

async def get_warehouses() -> List[Warehouse]:
    return await Warehouse.find(Warehouse.is_active == True).to_list()

async def register_transfer_out(target_warehouse_id: str, items: List[Dict[str, Any]], notes: str = None) -> Dict[str, Any]:
    target_warehouse = await Warehouse.find_one({"code": target_warehouse_id})
    if not target_warehouse:
        raise NotFoundException("Warehouse", target_warehouse_id)
        
    ref_id = f"GUIA-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    transferred_items = []
    total_cost = 0
    
    for item in items:
        sku = item['sku']
        quantity = item['quantity']
        
        product = await get_product_by_sku(sku)
        
        if product.stock_current < quantity:
            raise InsufficientStockException(sku, product.stock_current, quantity)
            
        movement = StockMovement(
            product_sku=sku,
            quantity=quantity,
            movement_type=MovementType.TRANSFER_OUT,
            warehouse_id="SL01", # Assuming Main Warehouse
            target_warehouse_id=target_warehouse.code,
            reference_document=ref_id,
            unit_cost=product.cost,
            notes=notes,
            date=datetime.now()
        )
        await movement.insert()
        
        product.stock_current -= quantity
        await product.save()
        
        transferred_items.append({
            "sku": product.sku,
            "name": product.name,
            "quantity": quantity
        })
        total_cost += quantity * product.cost
        
    return {
        "message": "Transfer registered successfully",
        "guide_number": ref_id,
        "target_warehouse": target_warehouse.name,
        "items_count": len(transferred_items),
        "total_cost": round(total_cost, 3)
    }

async def calculate_weighted_average_cost(product: Product, new_quantity: int, new_unit_cost: float) -> float:
    """
    Calcula el nuevo costo promedio ponderado.
    Fórmula: (valor_stock_actual + valor_nuevo_lote) / (cantidad_actual + cantidad_nueva)
    """
    current_value = product.stock_current * product.cost
    new_value = new_quantity * new_unit_cost
    total_value = current_value + new_value
    total_quantity = product.stock_current + new_quantity
    
    if total_quantity > 0:
        return round(total_value / total_quantity, 3)
    return product.cost

async def register_movement(
    sku: str, 
    quantity: int, 
    movement_type: MovementType, 
    reference: str,
    unit_cost: Optional[float] = None
) -> StockMovement:
    """
    Registra un movimiento de inventario y actualiza el stock del producto.
    Si es una entrada (IN) con unit_cost, recalcula el costo promedio ponderado.
    """
    product = await get_product_by_sku(sku)

    # Si es entrada con costo, calcular nuevo costo promedio
    if movement_type == MovementType.IN and unit_cost is not None:
        new_average_cost = await calculate_weighted_average_cost(product, quantity, unit_cost)
        product.cost = new_average_cost

    # Crear registro de movimiento (Kardex)
    movement = StockMovement(
        product_sku=sku,
        quantity=quantity,
        movement_type=movement_type,
        unit_cost=unit_cost or product.cost,
        reference_document=reference,
        date=datetime.now()
    )
    await movement.insert()

    # Actualizar stock actual
    if movement_type == MovementType.IN:
        product.stock_current += quantity
    elif movement_type == MovementType.OUT:
        if product.stock_current < quantity:
            raise InsufficientStockException(sku, product.stock_current, quantity)
        product.stock_current -= quantity
    
    await product.save()
    return movement

async def create_inventory_adjustment(sku: str, quantity_adjusted: int, reason: str, responsible: Optional[str] = None) -> Product:
    """
    Ajusta el stock de un producto por una cantidad específica (positiva o negativa)
    y registra el movimiento para auditoría.
    """
    if quantity_adjusted == 0:
        raise ValidationException("La cantidad a ajustar no puede ser cero.")

    product = await get_product_by_sku(sku)

    # Validar stock para ajustes negativos
    if quantity_adjusted < 0 and product.stock_current < abs(quantity_adjusted):
        raise InsufficientStockException(sku, product.stock_current, abs(quantity_adjusted))

    # Determinar el tipo de movimiento para el registro de auditoría (IN/OUT)
    # pero guardaremos el tipo general de "AJUSTE"
    actual_type = MovementType.IN if quantity_adjusted > 0 else MovementType.OUT

    # Crear el registro de movimiento para el Kardex
    movement = StockMovement(
        product_sku=sku,
        quantity=abs(quantity_adjusted),
        movement_type=MovementType.ADJUSTMENT,  # Usamos el tipo específico para identificarlo
        notes=reason,
        responsible=responsible,
        unit_cost=product.cost,
        reference_document=f"ADJUST-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    await movement.insert()

    # Actualizar el stock del producto
    product.stock_current += quantity_adjusted
    await product.save()

    return product
