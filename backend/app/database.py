import motor.motor_asyncio
from beanie import init_beanie
from app.config import MONGODB_URI, MONGO_DB_NAME

async def init_db():
    """
    Inicializa la conexión a la base de datos y los modelos de Beanie.
    """
    print(f"Conectando al servidor de MongoDB en: {MONGODB_URI}")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
    database = client[MONGO_DB_NAME]
    print(f"Usando la base de datos: {MONGO_DB_NAME}")

    # --- Modelos de Inventario ---
    from app.models.inventory import Product, Category, Warehouse, StockMovement, ProductHistory
    
    # --- Modelos de Compras ---
    from app.models.purchasing import Supplier, Order, Invoice
    
    # --- Modelos de Ventas (Ajustado) ---
    # SalesOrderDetail y SalesPayment son BaseModels, no Documents.
    from app.models.sales import Customer, SalesOrder, SalesInvoice

    document_models = [
        # Inventario
        Product, Category, Warehouse, StockMovement, ProductHistory,
        # Compras
        Supplier, Order, Invoice,
        # Ventas (Ajustado)
        Customer, SalesOrder, SalesInvoice,
    ]

    await init_beanie(database=database, document_models=document_models)
    print("Conexión a la base de datos y Beanie inicializados con éxito.")
