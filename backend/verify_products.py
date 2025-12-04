
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.inventory import Product

async def verify_connection_and_data():
    """
    Script to independently verify the database connection and check for data
    in the products collection.
    """
    load_dotenv(dotenv_path='backend/.env')
    mongodb_uri = os.getenv("MONGODB_URI")
    mongo_db_name = os.getenv("MONGO_DB_NAME")

    if not mongodb_uri or not mongo_db_name:
        print("Error: MONGODB_URI or MONGO_DB_NAME environment variables are not set.")
        return

    try:
        print(f"Connecting to MongoDB with URI: {mongodb_uri[:30]}...")
        client = AsyncIOMotorClient(mongodb_uri)
        await client.server_info()
        print("MongoDB connection successful.")

        database = client[mongo_db_name]
        print(f"Using database: {mongo_db_name}")

        print("Initializing Beanie...")
        await init_beanie(database=database, document_models=[Product])
        print("Beanie initialized successfully.")

        print("Checking for products...")
        product_count = await Product.count()
        print(f"Found {product_count} documents in the 'products' collection.")

        if product_count > 0:
            print("Attempting to retrieve one product...")
            product = await Product.find_one()
            print(f"Successfully retrieved a product: {product.name} (SKU: {product.sku})")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Note: If running from the root directory, ensure Python path is correct
    # This is designed to be run as: python -m backend.verify_products
    # To make it runnable directly, we adjust the path temporarily.
    import sys
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    
    # In a real scenario, you might need to adjust the path
    # to find the 'app' module. Let's assume it works from root.
    
    asyncio.run(verify_connection_and_data())
