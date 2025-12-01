import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def init_db():
    # Retrieve the MongoDB URI from environment variables
    # Default to a local instance for development if not set, but user specified Atlas
    mongo_uri = os.getenv("MONGODB_URI")
    
    if not mongo_uri:
        # Placeholder warning, in production this should be handled strictly
        print("WARNING: MONGODB_URI not set. Database connection will fail.")
        return

    client = AsyncIOMotorClient(mongo_uri)
    db_name = os.getenv("MONGO_DB_NAME", "erp_db")
    
    # Initialize Beanie with the database and document models
    await init_beanie(
        database=client[db_name], 
        document_models=[
            "app.models.inventory.Product",
            "app.models.inventory.StockMovement",
            "app.models.inventory.Warehouse",
            "app.models.inventory.DeliveryGuide",
            "app.models.purchasing.PurchaseOrder",
            "app.models.purchasing.PurchaseInvoice",
            "app.models.purchasing.Supplier",
            "app.models.sales.SalesOrder",
            "app.models.sales.SalesInvoice",
            "app.models.sales.Customer"
        ]

    )
